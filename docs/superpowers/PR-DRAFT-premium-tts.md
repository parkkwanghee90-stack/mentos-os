# PR Draft — Premium Lecture TTS: coverage + voice consistency

> Could not push/open automatically: the authenticated GitHub account (`breton5797`)
> lacks write access to `parkkwanghee90-stack/mentos-os` (403). To open this PR, either
> run the commands at the bottom from an account with write access, or add `breton5797`
> as a collaborator and ask me to push.

**Branch:** `feature/mathmentos_premium_tts` → `main` (20 commits)
**Suggested:** open as **Draft** (audio generation is partially complete — see Status).

---

## Title
```
Premium lecture TTS: fix path bug, slug SSOT, audit + generator, remove robotic fallback
```

## Body

### Summary
Premium AI lecture audio was frequently falling back to a robotic system voice. Root
cause analysis (verified against Supabase, not assumed) found **two** real bugs plus a
messy storage corpus:

1. **Audio path mismatch** — the player pre-encoded the Korean baseId with
   `encodeURIComponent` before `resolveAsset`, which defeated the `getSafePath`
   Korean→English mapping, so even already-generated audio 404'd → robotic Web Speech.
2. **`getSafePath` is unreliable** for many premium baseIds (produces empty/`"1"`/colliding
   paths, e.g. `시그마용법` and `수열의합` both → `sigma`). This caused root-level orphan
   files and junk folders, and made the storage path non-deterministic.

This PR makes premium audio resolution deterministic via an explicit **slug SSOT**, fixes
the path bug, unifies the TTS generation config, removes the robotic fallback, adds a
coverage audit, and rewrites the generator.

### Changes
- **Path bug fix:** audio path no longer pre-encodes the id (`src/lib/premiumAudioPath.js`),
  with a Red-Green test proving Korean→English resolution.
- **Slug SSOT** (`src/lib/premiumLectures.json` + `premiumLectures.js`): 34 lectures →
  unique ASCII slug + source-JSON, used by player, audit, and generator. ASCII slugs pass
  through `resolveAsset`/`getSafePath` unchanged, so upload and request paths can't diverge.
- **Shared modules:** `premiumLectureMap.js` (canonical baseId), `scripts/lib/ttsConfig.cjs`
  (single model/voice/prompt/`cleanNarration` SSOT), `scripts/lib/geminiTts.cjs` (shared
  caller with key-pool rotation + retry). Replaces 3 divergent generation scripts' config.
- **Player** (`PremiumLecturePlayer.jsx`): resolves JSON + audio via the slug SSOT; removed
  the two duplicated inline mapping chains; **replaced the robotic Web Speech fallback** with
  an "음성 준비 중" UI state (no jarring voice switch).
- **Modal** (`PremiumLectureModal.jsx`): hides 7 lectures that have no source content.
- **Audit** (`scripts/audit_premium_tts.cjs`): reports COMPLETE/GAP/NO_SOURCE per lecture +
  orphans/junk folders, against the SSOT.
- **Generator** (`scripts/generate_premium_gemini_tts.cjs`): rewritten — migrates each
  lecture's JSON to its clean slug path, then generates per-step audio with the unified
  config (single-call synthesis attempted first, falls back to per-step on silence-split
  mismatch). Idempotent + resumable. No hardcoded secrets (extra keys via env).
- **Cleanup** (`scripts/cleanup_premium_tts_orphans.cjs`): dry-run-by-default tool to remove
  root orphan files / non-SSOT folders.

### Voice consistency
All audio now uses one model (`gemini-3.1-flash-tts-preview`), one voice (`Aoede`), and one
prompt via the `ttsConfig` SSOT. The three biggest inconsistency sources (divergent scripts,
robotic fallback, broken/colliding paths) are eliminated. (Single-call whole-lecture
synthesis was attempted for intra-lecture timbre, but silence-splitting proved unreliable —
7 segments vs 6 steps on the first lecture — so per-step with the unified config is used.)

### Status (generation)
Code is complete and verified. **Audio generation COMPLETE: 34/34 lectures, 0 gaps**
(confirmed by `node scripts/audit_premium_tts.cjs` → `COMPLETE 34, GAP 0, NO_SOURCE 0`).

Generated over 3 rolling-quota windows (`gemini-3.1-flash-tts` caps at ~100 requests/day,
rolling 24h). The generator is idempotent + resumable, so each daily window picked up where
the previous stopped. All 34 lectures now have both their JSON migrated to the clean slug
path and per-step MP3s in Supabase.

### Test plan / evidence
- [x] `npm test` → 20/20 passing (premiumLectureMap, premiumAudioPath, premiumLectures,
      ttsConfig, geminiTts incl. key-rotation).
- [x] `npx vite build` → exit 0.
- [x] Path-bug regression test (Red-Green): `audioRelPath('고차방정식',1)` resolves to
      `audio/premium_lectures/higher_order_eq/step_1.mp3`.
- [x] End-to-end generator validation on `line_eq`: JSON migrated + 6 valid MP3s
      (16–28s each) generated and uploaded; player resolves them.
- [ ] Full generation to 0 gaps (blocked on Gemini quota — see Status).
- [ ] Manual browser check of 2–3 previously-robotic lectures.

### Follow-ups (not in this PR)
- Finish audio generation once quota is available.
- The 7 hidden lectures (삼각함수성질/그래프/활용, 미적분_미분법, 확률의 뜻, 정규분포,
  통계적 추정) need source lecture JSON before they can be generated/re-shown.
- Folder cleanup needs human judgment: `derivative_app_2/3`, `independent_trials`,
  `recursive_def` hold real audio for lectures not currently exposed in the modal.
- `toBaseId` over-collapses the 수열 family (등차등비→등차수열, 시그마용법→수열의합); the
  slug SSOT side-steps this for the modal, but the helper could be tightened later.
- Rotate the Supabase service_role key and Gemini key (both were shared in chat).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

## Commands to open the PR (from an account with write access)
```bash
cd /Users/mac/mathmentos-mathmentos_premium_tts
git push -u origin feature/mathmentos_premium_tts
gh pr create --draft --base main \
  --title "Premium lecture TTS: fix path bug, slug SSOT, audit + generator, remove robotic fallback" \
  --body-file docs/superpowers/PR-DRAFT-premium-tts.md
```
