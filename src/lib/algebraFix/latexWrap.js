import katex from 'katex';

// Matches LaTeX commands or superscript/subscript — signals math content
const MATH_SIGNAL = /\\[a-zA-Z]+|[\^_]/;

// Regex to find existing $…$ spans (non-greedy, respects escaped \$)
const EXISTING_DOLLAR_RE = /(?<!\\)\$(?:[^$\\]|\\[\s\S])*?\$/g;

// Regex to find runs that contain no Korean syllables/jamo, no newlines, no option markers
const NON_KOREAN_RUN_RE = /[^가-힣ㄱ-ㆎ\n①②③④⑤]+/g;

/**
 * Attempt to wrap a trimmed candidate string in $…$ after validating with katex.
 * Returns null if katex fails.
 *
 * @param {string} trimmed
 * @returns {{ wrapped: string } | { error: string } | null}
 */
function tryWrap(trimmed) {
  if (!trimmed) return null;
  try {
    katex.renderToString(trimmed, { throwOnError: true });
    return { wrapped: true };
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Process a single gap (text outside existing $…$ spans) and wrap math runs.
 *
 * @param {string} gap
 * @returns {{ result: string, wrapped: number, skipped: Array<{run:string,error:string}> }}
 */
function processGap(gap) {
  let wrapped = 0;
  const skipped = [];
  let result = '';
  let lastIndex = 0;

  const runRe = new RegExp(NON_KOREAN_RUN_RE.source, 'g');
  let match;

  while ((match = runRe.exec(gap)) !== null) {
    // Append any text between lastIndex and this match start (Korean text)
    result += gap.slice(lastIndex, match.index);
    lastIndex = match.index + match[0].length;

    const run = match[0];

    if (!MATH_SIGNAL.test(run)) {
      // No math signal — leave untouched
      result += run;
      continue;
    }

    // Has math signal — try to wrap
    const leadingWS = run.match(/^(\s*)/)[1];
    const trailingWS = run.match(/(\s*)$/)[1];
    const trimmed = run.trim();

    if (!trimmed) {
      result += run;
      continue;
    }

    const outcome = tryWrap(trimmed);
    if (!outcome) {
      result += run;
      continue;
    }

    if (outcome.wrapped) {
      result += `${leadingWS}$${trimmed}$${trailingWS}`;
      wrapped++;
    } else {
      // katex failed — leave untouched, record in skipped
      result += run;
      skipped.push({ run: trimmed.slice(0, 120), error: outcome.error });
    }
  }

  // Append remaining text after last run
  result += gap.slice(lastIndex);

  return { result, wrapped, skipped };
}

/**
 * Process a single even-index part (not a separator) by:
 * 1. Finding existing $…$ spans (leave verbatim)
 * 2. Processing gaps between/around them with processGap()
 *
 * @param {string} part
 * @returns {{ result: string, wrapped: number, skipped: Array<{run:string,error:string}> }}
 */
function processPart(part) {
  let totalWrapped = 0;
  const totalSkipped = [];
  let result = '';
  let lastIndex = 0;

  const dollarRe = new RegExp(EXISTING_DOLLAR_RE.source, 'g');
  let match;

  while ((match = dollarRe.exec(part)) !== null) {
    // Gap before this existing $…$ span
    const gap = part.slice(lastIndex, match.index);
    const gapResult = processGap(gap);
    result += gapResult.result;
    totalWrapped += gapResult.wrapped;
    totalSkipped.push(...gapResult.skipped);

    // Keep existing $…$ verbatim
    result += match[0];
    lastIndex = match.index + match[0].length;
  }

  // Trailing gap after last $…$ span (or the whole part if none found)
  const trailingGap = part.slice(lastIndex);
  const trailingResult = processGap(trailingGap);
  result += trailingResult.result;
  totalWrapped += trailingResult.wrapped;
  totalSkipped.push(...trailingResult.skipped);

  return { result, wrapped: totalWrapped, skipped: totalSkipped };
}

/**
 * Wrap un-delimited LaTeX in $…$ conservatively.
 * Only wraps a candidate span if katex.renderToString succeeds.
 *
 * @param {string} raw
 * @returns {{ output: string, wrapped: number, skipped: Array<{run:string,error:string}> }}
 */
export function wrapPlainLatex(raw) {
  if (!raw || typeof raw !== 'string') {
    return { output: raw, wrapped: 0, skipped: [] };
  }

  // Split on literal \n (backslash+n) or real newline, preserving separators at odd indices
  const parts = raw.split(/(\\n|\n)/);

  let totalWrapped = 0;
  const totalSkipped = [];
  const newParts = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // Separator — keep verbatim
      newParts.push(parts[i]);
      continue;
    }

    const { result, wrapped, skipped } = processPart(parts[i]);
    newParts.push(result);
    totalWrapped += wrapped;
    totalSkipped.push(...skipped);
  }

  return {
    output: newParts.join(''),
    wrapped: totalWrapped,
    skipped: totalSkipped,
  };
}
