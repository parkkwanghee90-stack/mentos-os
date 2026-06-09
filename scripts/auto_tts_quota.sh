#!/bin/bash
# Auto-generate prepared TTS clips once Gemini daily quota resets.
# Scope: fill the 42 gap clips (quad_eq/quad_func) + the 2 recovered clips (circle_s2#13,
# complex_s3#15) AND overwrite the 163 legacy OpenAI clips with Gemini 3.1 (--overwrite-openai).
# Idempotent: skips clips already Gemini, fills gaps, overwrites only OpenAI. Resumes across
# days until tts_completion_check.cjs reports COMPLETE (then sets the done-marker).
# Triggered by launchd (com.mentos.autotts) at several KST times around the PT-midnight reset.
set -u
cd /Users/mac/mathmentos || exit 1
NODE=/usr/local/bin/node
MARK="scripts/.auto_tts_done"
LOG="scripts/tts_progress.log"

[ -f "$MARK" ] && exit 0   # already fully completed on a prior run

# Quota probe: tiny TTS request against EACH key; YES if either key has quota.
# A 429 (exhausted) consumes nothing; a 200 consumes one slot. stdout-only sentinel so the
# dotenv(x) banner cannot pollute the result (we grep for the exact token).
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

# Initial gate — fast-exit while still blocked (no hang, no work, no wasted completion scan).
if ! precheck_ok; then
  echo "[$(date)] auto_tts precheck: blocked (429) — will retry next schedule" >> "$LOG"
  exit 0
fi

# Jobs: "chapter:flag". Empty flag = gap-fill only. --overwrite-openai = overwrite legacy
# OpenAI clips + fill gaps. quad_eq/quad_func/complex have no OpenAI (pure gap-fill).
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
  # Re-probe before each chapter: once quota is exhausted, STOP rather than let the
  # generator's 65s-retry loop hang each remaining chapter until its 30-min timeout.
  if ! precheck_ok; then
    echo "[$(date)] auto_tts: quota exhausted before '$ch' — stopping; resume next schedule" >> "$LOG"
    break
  fi
  echo "[$(date)] auto_tts generating: $ch ${flag:-（gap-fill）}" >> "$LOG"
  # No `timeout` binary on macOS; the generator self-limits (bounded retries + abort on
  # quota/credit/hang via a 180s per-request AbortController), so call node directly.
  "$NODE" scripts/generate_gemini_math_sang_tts.cjs "$ch" $flag >> "$LOG" 2>&1
done

# Completion check (no quota cost): only mark done when all gaps filled AND no OpenAI remain.
RES=$("$NODE" scripts/tts_completion_check.cjs 2>/dev/null)
echo "[$(date)] auto_tts completion: $RES" >> "$LOG"
if echo "$RES" | grep -q "TTS_COMPLETE"; then
  touch "$MARK"
  echo "[$(date)] auto_tts COMPLETE — marker set, will not re-run." >> "$LOG"
fi
