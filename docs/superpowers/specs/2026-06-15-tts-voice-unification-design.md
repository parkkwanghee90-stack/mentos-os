# TTS Voice Unification — 수학 상/하/수1/수2 → Gemini 3.1 + Aoede

- **Date:** 2026-06-15
- **Status:** Approved design (Approach A) — ready for implementation planning
- **Repo:** `/Users/mac/mathmentos` (`mentos-os`), branch `feat/tts-voice-unification`

## 1. Goal

Make every piece of TTS audio across the four math subjects — 수학 상, 수학 하, 수1, 수2 — speak in **one voice: `gemini-3.1-flash-tts-preview` + `Aoede`** — and enforce it structurally so the voice cannot drift again.

> Analogy: today the app is a dubbed film where three different voice actors recorded different scenes. We are re-dubbing the off-voice scenes with the one canonical actor and firing the other two actors so no future scene can use them.

## 2. Why the voice is inconsistent today (root causes)

Audio is produced by **three diverging paths**:

| Path | Where | Model / Voice | Status |
|---|---|---|---|
| Canonical generators | `generate_gemini_math_sang_tts.cjs`, `generate_su1_tts.cjs`, `generate_gemini_math_su1_tts.cjs` | **3.1 + Aoede** | correct |
| Legacy generators | `generate_gemini_gocha_tts.cjs`, `bulk_generate_tts.cjs` | **2.5 + Aoede** (different timbre despite same voice name) | off-voice |
| Live runtime | `src/services/ttsService.js` (`speakText`) | **2.5 + Aoede** → OpenAI `tts-1` nova → browser voice | off-voice |

`src/services/ttsService.js` is imported by 5 components: `WhiteFocusMode`, `hints/GeometryHintPlayer`, `pages/NaesinCourse`, `pages/MentosMockExam`, `pages/LocalInspector`.

## 3. Scope decisions (confirmed with user)

1. **Both layers in scope:** fix the code/pipeline **and** regenerate off-voice clips already shipped.
2. **수학 하 / 수2:** pipeline-readiness only — they have no TTS audio yet. Ensure the unified generators will produce 3.1+Aoede when their content is authored later. **Do not** generate 하/수2 content now.
3. **Runtime path:** switch the live Gemini call from 2.5 → 3.1+Aoede; **keep** the OpenAI→browser fallbacks as last resort (only reached when 3.1 quota is exhausted or the key is missing).
4. **Regen strategy:** targeted — audit provenance first, regenerate only clips not provably 3.1.

## 4. Key technical constraints (load-bearing)

- **2.5 vs 3.1 is NOT acoustically detectable.** The existing classifier `scripts/lib/tts_engine_classifier.cjs` separates only **gemini vs openai** (via the libmp3lame `Xing`/`Info` VBR header). Both Gemini models get the same ffmpeg re-encode, so both look identical. **Therefore provenance of 2.5-vs-3.1 comes only from the manifest** (`scripts/tts_manifest.json`, per-clip `{engine, model, voice}`) plus known-bad filename patterns (`hint_gocha_*`).
- **Regeneration is idempotent toward Gemini.** Re-rendering an already-3.1 clip with 3.1 reproduces the same voice — no data/voice harm, only quota cost. So over-including a few already-3.1 clips in the suspect set is safe.
- **Quota bottleneck:** `gemini-3.1-flash-tts-preview` ≈ **100 clips/day/project**, reset 09:00 KST, independent of billing. Regen is multi-day if the suspect set is large.
- **Narration source:** generators build narration from the AVS hint JSONs at Supabase `mentos-assets/math_hints/{safePath}/NNN.json` (local cache in `scripts/.su1_hint_cache`). Regen reuses this, so **content stays identical — only the voice changes** — provided the source JSON is unchanged since the original render.

## 5. Architecture (Approach A: single SSOT + targeted idempotent regen)

### New files
- **`scripts/lib/ttsVoice.cjs`** — the one source of truth for Node generators:
  - `TTS_MODEL = 'gemini-3.1-flash-tts-preview'`
  - `TTS_VOICE = 'Aoede'`
  - `synthesize(text, opts)` helper (wraps the `generateContent` call + ffmpeg re-encode used by the canonical generators).
- **`src/config/ttsVoice.js`** — browser mirror (constants only: model + voice). No secrets.
- **`scripts/audit_tts_voice.cjs`** — provenance audit (see §6).
- **`scripts/regen_tts_from_worklist.cjs`** — quota-aware, resumable regen runner (see §6).

### Edited files
- `generate_gemini_gocha_tts.cjs`, `bulk_generate_tts.cjs` — import the SSOT (model 2.5 → 3.1); mark deprecated in favor of the canonical generators.
- `generate_gemini_math_sang_tts.cjs`, `generate_su1_tts.cjs`, `generate_gemini_math_su1_tts.cjs` — import the SSOT (no behavior change; remove duplicated local constants).
- `src/services/ttsService.js` — Gemini call 2.5 → 3.1 + Aoede via `src/config/ttsVoice.js`; fallbacks unchanged.

### Immutability / style
All new code follows the repo + global rules: no mutation, small focused files (<400 lines), secrets only from `.env` (`SUPABASE_SERVICE_ROLE_KEY`, Gemini keys — never hardcoded), comprehensive error handling, no `console.log` left as control flow.

## 6. Data flow

```
audit_tts_voice.cjs
  ├─ read tts_manifest.json            (985 confirmed 3.1+Aoede)
  ├─ read generators' STAGES tables + src/data/tts_map.json + src/config/pathMapping.js
  ├─ build reverse map:  manifest key  ttsDir/NNN.mp3  ↔  local hint_{slug}_{step}_{NNN}.mp3
  ├─ enumerate local public/audio/math_hints/*.mp3  (and Supabase math-tts where relevant)
  ├─ classify each clip:
  │     confirmed-3.1 = present in manifest as 3.1
  │     suspect       = unmanifested  OR  known-2.5 pattern (hint_gocha_*)
  │     orphan-source = no hint JSON found (flag, cannot regen faithfully)
  └─ emit tts_regen_worklist.json  { confirmed[], suspect[], orphanSource[], counts }

regen_tts_from_worklist.cjs
  ├─ read tts_regen_worklist.json (suspect[])
  ├─ for each clip (batched ~100/day, resumable):
  │     reuse the matching canonical generator's text-sourcing + synthesize() (SSOT 3.1+Aoede)
  │     write public/audio/math_hints/  +  upload Supabase  +  update tts_manifest.json
  └─ stop at daily quota; resume next run

re-run audit_tts_voice.cjs → assert suspect count == 0  (completion gate)
```

## 7. Phasing

| Phase | Content | Quota | Shippable |
|---|---|---|---|
| **1 — Code SSOT** | Create `ttsVoice` modules; repoint all generators + runtime; deprecate 2.5 paths | none | yes (PR) |
| **2 — Audit** | Run `audit_tts_voice.cjs`; commit `tts_regen_worklist.json` with real counts | none | yes (PR) |
| **3 — Regen** | Batch ~100/day from worklist until audit reports 0 suspects | bound | incremental |

Phase 1 + 2 land first as a single PR (no quota). Phase 3 runs over multiple days (existing launchd auto-harvest pattern can drive it).

## 8. Error handling

- Missing env keys → fail-fast with a clear message (no silent OpenAI fallback in batch generation).
- Supabase upload failure → retry (existing 3-attempt backoff), then record in worklist as `failed[]` for the next run.
- `orphanSource` clips (no hint JSON) → never regenerated blindly; listed for manual review.
- Quota 429 → stop cleanly, persist progress, exit 0 so the resumable runner can continue next day.

## 9. Testing

- **Unit (vitest / node):**
  - `ttsVoice.cjs` / `ttsVoice.js` export the exact canonical constants.
  - Reverse-map builder: sample `(manifest key) ↔ (local filename)` fixtures resolve correctly.
  - Audit classification: manifest-present → `confirmed`; `hint_gocha_*` → `suspect`; missing JSON → `orphanSource`.
- **Verification (evidence-based, fresh run):**
  - `node scripts/audit_tts_voice.cjs` BEFORE → N suspects; AFTER Phase 3 → **0 suspects**.
  - Grep guard: no remaining `gemini-2.5-flash-preview-tts` reference in `scripts/` generators or `src/services/ttsService.js`.
  - Manual: a regenerated `hint_gocha_*` clip plays in the app and matches the canonical voice.

## 10. Out of scope

- The 42 `public/audio/suneung_tts/` 모의고사 clips (미적분/확통 — not the 4 core subjects). May be revisited separately.
- Generating 수학 하 / 수2 AVS content (pipeline-readiness only).
- `git filter-repo` history secret scrub (tracked separately in the bugfix roadmap).

## 11. Open items to confirm during planning

- Exact suspect count (produced by Phase 2 audit — currently an upper-bound estimate of ~440 unmanifested + 20 `gocha`).
- Whether the manifest's Supabase `math-tts` world fully corresponds to the local `public/audio/math_hints` files, or whether some local clips have no manifest counterpart at all (the reverse-map builder resolves this empirically).
