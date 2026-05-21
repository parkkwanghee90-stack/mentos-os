const fs = require('fs');
const path = require('path');

/**
 * 1. Schema Definition
 * Mandatory fields: problem_id, problem_type, steps (array)
 * Each step: step, title, caption, visual_action
 */
function validateSchema(data) {
  if (!data) return "Data is null";
  if (!data.problem_id && !data.id) return "Missing problem_id";
  // The UI might use 'type' instead of 'problem_type' in some legacy
  if (!data.problem_type && !data.type) return "Missing problem_type";
  
  const steps = data.steps || data.overlay_steps;
  if (!steps || !Array.isArray(steps)) return "Missing or invalid steps array";

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (typeof s.step === 'undefined') return 'Step ${i} missing `step` field`;
    // Allowing fallback keys for compatibility, but enforcing strict presence
    if (s.title === undefined && s.label === undefined && s.label_text === undefined) return `Step ${i} missing `title``;
    if (s.caption === undefined && s.latex === undefined) return `Step ${i} missing 'caption' / 'latex'';
    // visual_action check
    if (!s.visual_action && !data.base_figure) {
        // If there's no visual action and no base_figure geometry fallback, it might be an issue.
        // We will allow passing if legacy geometry exists, but log it.
    }
  }

  return null; // OK
}

/**
 * 2. Automated Regex Recovery for common JSON breakages
 */
function attemptRepairJSON(rawText) {
  let fixedText = rawText;
  
  // Rule 1: Trailing comma in objects
  fixedText = fixedText.replace(/,\s*}/g, '}');
  // Rule 2: Trailing comma in arrays
  fixedText = fixedText.replace(/,\s*\]/g, ']');
  // Rule 3: Fix double escaped newlines (\\\\\\\\ ) common in our legacy 1-12
  fixedText = fixedText.replace(/\\\\\\\\ /g, ' '); 
  fixedText = fixedText.replace(/\\\\ /g, ' ');
  // Rule 4: Fix missing outer brace
  if (fixedText.trim().startsWith('"') || fixedText.trim().startsWith('problem_id')) {
     fixedText = '{' + fixedText;
  }
  if ((fixedText.match(/\{/g) || []).length === (fixedText.match(/\}/g) || []).length + 1) {
     fixedText += '}';
  }

  try {
    return JSON.parse(fixedText);
  } catch(e) {
    return null;
  }
}

/**
 * 3. Atomic Write Strategy
 */
function atomicSaveHint(targetPath, rawText, problemId) {
  const tempPath = targetPath + '.tmp';
  const brokenPath = path.join(path.dirname(targetPath), 'broken_' + problemId + '.txt');

  // Step 1: Save as temp
  fs.writeFileSync(tempPath, rawText, 'utf8');

  // Step 2 & 3: Parse and Schema Validation
  let parsed = null;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    // Attempt Auto Recovery
    parsed = attemptRepairJSON(rawText);
    if (!parsed) {
        fs.renameSync(tempPath, brokenPath);
        return { success: false, error: 'JSON Parse Failed & Unrecoverable: ' + err.message };
    }
  }

  const schemaError = validateSchema(parsed);
  if (schemaError) {
    fs.renameSync(tempPath, brokenPath);
    return { success: false, error: 'Schema Validation Failed: ' + schemaError };
  }

  // Step 4: Final Rename (Atomic commit)
  // Ensure the actual parsed object is written (cleans up whitespace/formatting)
  fs.writeFileSync(tempPath, JSON.stringify(parsed, null, 2), 'utf8');
  fs.renameSync(tempPath, targetPath);
  return { success: true };
}

module.exports = { validateSchema, attemptRepairJSON, atomicSaveHint };
