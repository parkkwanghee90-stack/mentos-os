import katex from 'katex';
import { normalizeMathText } from './normalize.js';
import { detectIssues } from './latexDetect.js';

// Matches LaTeX commands or superscript/subscript — signals math content
const MATH_SIGNAL = /\\[a-zA-Z]+|[\^_]/;

// Regex to find existing spans: $$…$$ display math FIRST, then $…$ inline.
// Display math must be matched first so its inner content is never treated as a gap.
const SPAN_RE_SRC = /\$\$[\s\S]*?\$\$|(?<!\\)\$(?:[^$\\]|\\[\s\S])*?\$/.source;

// Detects an unescaped $ (used by the imbalance guard on residual gap text)
const UNESCAPED_DOLLAR = /(?<!\\)\$/;

// Regex to find runs that contain no Korean syllables/jamo, no newlines, no option markers
const NON_KOREAN_RUN_RE = /[^가-힣ㄱ-ㆎ\n①②③④⑤]+/g;

// Single Korean syllable/jamo — used for boundary-ambiguity detection
const KOREAN_CHAR = /[가-힣ㄱ-ㆎ]/;

// Three-or-more consecutive dollars — always a corruption signal
const TRIPLE_DOLLAR = /\$\$\$/;

/**
 * Count consecutive double-dollar (`$$`) sequences — proxy for display-math
 * delimiters. Used to reject candidates that introduce NEW `$$` (inline → display
 * corruption) that the original part did not have.
 *
 * @param {string} s
 * @returns {number}
 */
function countDoubleDollar(s) {
  return (s.match(/\$\$/g) || []).length;
}

/**
 * Post-validation net: a candidate string is "clean" only if its $ structure
 * is well-formed and every span's inner content renders under katex.
 * 1. No `$$$` (3+ consecutive dollars).
 * 2. Unescaped `$` count is even.
 * 3. Every $$…$$ / $…$ span's inner renders via katex (normalized for validation).
 *
 * @param {string} s
 * @returns {boolean}
 */
function partIsClean(s) {
  if (TRIPLE_DOLLAR.test(s)) return false;

  const dollars = (s.match(/(?<!\\)\$/g) || []).length;
  if (dollars % 2 !== 0) return false;

  const normalized = normalizeMathText(s);
  const spanRe = new RegExp(SPAN_RE_SRC, 'g');
  let match;
  while ((match = spanRe.exec(normalized)) !== null) {
    const token = match[0];
    // Strip $$…$$ or $…$ delimiters to get inner content
    const inner = token.startsWith('$$')
      ? token.slice(2, -2)
      : token.slice(1, -1);
    try {
      katex.renderToString(inner, { throwOnError: true });
    } catch {
      return false;
    }
  }
  return true;
}

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
 * Process a single gap (text outside existing $$…$$ / $…$ spans) and wrap math runs.
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

    // Boundary-ambiguity guard: if the run touches Korean prose with no
    // whitespace cushion (e.g. `이고, \cos`), wrapping would glue `$` directly
    // to a Korean character (`이고$,`). Leave such ambiguous runs untouched.
    const prevChar = gap[match.index - 1];
    const nextChar = gap[match.index + run.length];
    const koreanLeftAdjacent = leadingWS === '' && prevChar !== undefined && KOREAN_CHAR.test(prevChar);
    const koreanRightAdjacent = trailingWS === '' && nextChar !== undefined && KOREAN_CHAR.test(nextChar);
    if (koreanLeftAdjacent || koreanRightAdjacent) {
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
 * Tokenize a part into existing spans ($$…$$ / $…$, kept verbatim) and gaps
 * (text between/around spans, candidates for wrapping).
 *
 * @param {string} part
 * @returns {{ spans: string[], gaps: string[] }}
 *   spans[i] is the i-th existing span; gaps[i] is the text before spans[i],
 *   with gaps[spans.length] being the trailing text. (gaps.length === spans.length + 1)
 */
function tokenize(part) {
  const spans = [];
  const gaps = [];
  const spanRe = new RegExp(SPAN_RE_SRC, 'g');
  let lastIndex = 0;
  let match;

  while ((match = spanRe.exec(part)) !== null) {
    gaps.push(part.slice(lastIndex, match.index));
    spans.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  gaps.push(part.slice(lastIndex));

  return { spans, gaps };
}

/**
 * Process a single even-index part (not a separator) by:
 * 1. Tokenizing into existing $$…$$ / $…$ spans (verbatim) and gaps.
 * 2. Imbalance guard (cheap early-out): if any residual gap still contains an
 *    unescaped $, the $ structure is broken — leave the part untouched.
 * 3. Build a wrapped candidate, then apply a post-validation net: only adopt
 *    the candidate if partIsClean(candidate) holds AND it does not worsen the
 *    detectIssues count vs. the original. Otherwise revert to the original
 *    part (no change → REVIEW domain). This guarantees mis-paired $ items
 *    (even-count but wrongly delimited) never produce $$$ corruption.
 *
 * @param {string} part
 * @returns {{ result: string, wrapped: number, skipped: Array<{run:string,error:string}> }}
 */
function processPart(part) {
  const { spans, gaps } = tokenize(part);

  // Imbalance guard: a clean part has no stray unescaped $ left in any gap.
  if (gaps.some((gap) => UNESCAPED_DOLLAR.test(gap))) {
    return { result: part, wrapped: 0, skipped: [] };
  }

  let candidateWrapped = 0;
  const candidateSkipped = [];
  let candidate = '';

  for (let i = 0; i < gaps.length; i++) {
    const gapResult = processGap(gaps[i]);
    candidate += gapResult.result;
    candidateWrapped += gapResult.wrapped;
    candidateSkipped.push(...gapResult.skipped);

    if (i < spans.length) {
      // Keep existing span verbatim
      candidate += spans[i];
    }
  }

  // Nothing wrapped → candidate equals original; nothing to validate/adopt.
  if (candidateWrapped === 0) {
    return { result: part, wrapped: 0, skipped: candidateSkipped };
  }

  // Post-validation net: adopt candidate only if it is structurally clean and
  // does not worsen detectIssues vs. the original.
  if (!partIsClean(candidate)) {
    return { result: part, wrapped: 0, skipped: candidateSkipped };
  }
  // No-new-$$ invariant: wrapping must only insert single $…$ delimiters.
  // If the candidate has more consecutive `$$` than the original, a mis-paired
  // stray $ turned an inline span into display math (e.g. `3$\sqrt2$` →
  // `3$$\sqrt2$$`) — semantic corruption that partIsClean/detectIssues miss.
  if (countDoubleDollar(candidate) > countDoubleDollar(part)) {
    return { result: part, wrapped: 0, skipped: candidateSkipped };
  }
  if (detectIssues(candidate).length > detectIssues(part).length) {
    return { result: part, wrapped: 0, skipped: candidateSkipped };
  }

  return { result: candidate, wrapped: candidateWrapped, skipped: candidateSkipped };
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
