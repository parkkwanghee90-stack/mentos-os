// Builds the premium-lecture audio path WITHOUT encodeURIComponent so that
// resolveAsset/getSafePath can map Korean baseIds to their English storage paths.
// Caller passes the result to window.resolveAsset(), mirroring the JSON fetch.

export function audioRelPath(baseId, step) {
  return `/audio/premium_lectures/${baseId}/step_${step}.mp3`;
}
