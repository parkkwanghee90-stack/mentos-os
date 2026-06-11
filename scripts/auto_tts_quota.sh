#!/bin/bash
# Auto-generate prepared TTS clips once Gemini daily quota resets.
# Scope: (1) math-sang gaps + legacy OpenAI overwrites (generate_gemini_math_sang_tts.cjs)
#        (2) 수1(수학I) full-range gap-fill (generate_su1_tts.cjs)
# Idempotent: skips clips already present/Gemini. Resumes across days until BOTH
# completion checks pass (then sets the done-marker).
# Triggered by launchd (com.mentos.autotts) at several KST times around the PT-midnight reset.
set -u
cd /Users/mac/mathmentos || exit 1
# launchd 기본 PATH(/usr/bin:/bin:...)에는 /usr/local/bin이 없어 생성기의 ffmpeg 호출이
# "command not found"로 깨진다(생성 quota만 소모). 어떤 트리거든 동일 환경이 되도록 보강.
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
NODE=/usr/local/bin/node
MARK="scripts/.auto_tts_done"
LOG="scripts/tts_progress.log"

[ -f "$MARK" ] && exit 0   # already fully completed on a prior run

# Single-instance lock: long runs (su1 ≈1,300 clips) can span multiple launchd slots;
# skip this slot if a previous instance is still generating. Stale-lock guard: a lock
# older than 12h is from a crashed run (clean aborts remove it) — reclaim it.
LOCK="scripts/.auto_tts.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +720 2>/dev/null)" ]; then
    echo "[$(date)] auto_tts: reclaiming stale lock (>12h)" >> "$LOG"
    rmdir "$LOCK" 2>/dev/null
    mkdir "$LOCK" 2>/dev/null || { echo "[$(date)] auto_tts: lock race — skipping" >> "$LOG"; exit 0; }
  else
    echo "[$(date)] auto_tts: another instance is running — skipping this slot" >> "$LOG"
    exit 0
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

# Quota probe: tiny TTS request against EACH key; YES if either key has quota.
# NOTE: a 200 probe CONSUMES one request — key2's burst quota is tiny, so probes are
# spent ONLY for the sang generator (it lacks cooldown-retry). su1 runs probe-free.
precheck_ok() {
  local out
  out=$("$NODE" -e '
    const d=require("dotenv");d.config();
    (async()=>{
      const keys=[process.env.VITE_GEMINI_API_KEY,process.env.VITE_GEMINI_API_KEY_2].filter(Boolean);
      if(!keys.length){process.stdout.write("PRECHECK=NOKEY");return;}
      for(const k of keys){
        const c=new AbortController();const tm=setTimeout(()=>c.abort(),25000);
        try{
          const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${k}`,{
            method:"POST",headers:{"Content-Type":"application/json"},signal:c.signal,
            body:JSON.stringify({contents:[{parts:[{text:"안녕하세요"}]}],generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:"Aoede"}}}}})});
          clearTimeout(tm);
          if(r.ok){process.stdout.write("PRECHECK=YES");return;}
        }catch(e){clearTimeout(tm);}  // abort/timeout (hanging key) => treat as unavailable
      }
      process.stdout.write("PRECHECK=NO");
    })().catch(()=>process.stdout.write("PRECHECK=NO"));' 2>/dev/null)
  echo "$out" | grep -q "PRECHECK=YES"
}

# ── (1) math-sang scope ─────────────────────────────────────────────────────
# Completion check is quota-free; once sang is COMPLETE, skip its jobs AND all
# prechecks so key2's small burst quota goes entirely to su1 generation.
SANG_RES=$("$NODE" scripts/tts_completion_check.cjs 2>/dev/null)
if echo "$SANG_RES" | grep -q "TTS_COMPLETE"; then
  echo "[$(date)] auto_tts: sang scope COMPLETE — skipping sang jobs/prechecks" >> "$LOG"
else
  # Initial gate — fast-exit while still blocked (no hang, no work).
  if ! precheck_ok; then
    echo "[$(date)] auto_tts precheck: blocked (429) — sang skipped; su1 will self-manage" >> "$LOG"
  else
    # Jobs: "chapter:flag". Empty flag = gap-fill only. --overwrite-openai = overwrite
    # legacy OpenAI clips + fill gaps.
    JOBS=(
      "quad_eq:"
      "quad_func:"
      "complex:"
      "point:"
      "cases:--overwrite-openai"
      "circle:--overwrite-openai"
      "line:--overwrite-openai"
      "quad_ineq:--overwrite-openai"
      "shape_move:--overwrite-openai"
    )
    for job in "${JOBS[@]}"; do
      ch="${job%%:*}"
      flag="${job#*:}"
      # Re-probe before each chapter: the sang generator lacks cooldown-retry, so
      # stop early rather than let it abort mid-chapter.
      if ! precheck_ok; then
        echo "[$(date)] auto_tts: quota exhausted before '$ch' — stopping sang; resume next schedule" >> "$LOG"
        break
      fi
      echo "[$(date)] auto_tts generating: $ch ${flag:-（gap-fill）}" >> "$LOG"
      "$NODE" scripts/generate_gemini_math_sang_tts.cjs "$ch" $flag >> "$LOG" 2>&1
    done
  fi
fi

# ── (2) 수1 scope ───────────────────────────────────────────────────────────
# No precheck: the su1 generator has burst-cooldown retry (90s x6) and clean-aborts
# on true exhaustion, so probing here would only waste burst quota.
echo "[$(date)] auto_tts generating: su1 all (gap-fill)" >> "$LOG"
"$NODE" scripts/generate_su1_tts.cjs all >> "$LOG" 2>&1

# Completion check (no quota cost): mark done only when BOTH the math-sang scope
# (gaps filled AND no legacy OpenAI) and the su1 scope (all hint clips present) finish.
RES=$("$NODE" scripts/tts_completion_check.cjs 2>/dev/null)
RES_SU1=$("$NODE" scripts/su1_tts_completion_check.cjs 2>/dev/null)
echo "[$(date)] auto_tts completion: $RES | $(echo "$RES_SU1" | grep -o 'SU1_GAPS=[0-9]*' | head -1)" >> "$LOG"
if echo "$RES" | grep -q "TTS_COMPLETE" && echo "$RES_SU1" | grep -q "SU1_TTS_COMPLETE"; then
  touch "$MARK"
  echo "[$(date)] auto_tts COMPLETE — marker set, will not re-run." >> "$LOG"
fi
