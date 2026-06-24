import { describe, it, expect } from 'vitest';
import audit from './ttsAudit.cjs';

describe('classifyClips', () => {
  const manifest = { 'complex_s3/015.mp3': { model: 'gemini-3.1-flash-tts-preview', voice: 'Aoede' } };
  it('manifest에 3.1로 있으면 confirmed', () => {
    const r = audit.classifyClips({ bucketKeys: ['complex_s3/015.mp3'], manifest, knownLegacy: [] });
    expect(r.confirmed).toContain('complex_s3/015.mp3');
    expect(r.suspect).toHaveLength(0);
  });
  it('manifest에 없으면 suspect', () => {
    const r = audit.classifyClips({ bucketKeys: ['higher_eq_s2/001.mp3'], manifest, knownLegacy: [] });
    expect(r.suspect).toContain('higher_eq_s2/001.mp3');
  });
  it('known-legacy 패턴은 manifest에 있어도 suspect로 강제', () => {
    const m = { 'higher_eq_s2/001.mp3': { model: 'gemini-3.1-flash-tts-preview', voice: 'Aoede' } };
    const r = audit.classifyClips({ bucketKeys: ['higher_eq_s2/001.mp3'], manifest: m, knownLegacy: ['higher_eq_s2/001.mp3'] });
    expect(r.suspect).toContain('higher_eq_s2/001.mp3');
  });
});

describe('inFourSubjectScope', () => {
  it('u<digit>_ 폴더는 범위 밖', () => {
    expect(audit.inFourSubjectScope('u1_perm/001.mp3')).toBe(false);
    expect(audit.inFourSubjectScope('u8_def_integ/003.mp3')).toBe(false);
  });
  it('4과목 폴더는 범위 안', () => {
    expect(audit.inFourSubjectScope('cases_s2/001.mp3')).toBe(true);
    expect(audit.inFourSubjectScope('trig_graph/113.mp3')).toBe(true);
    expect(audit.inFourSubjectScope('def_integ_s2/001.mp3')).toBe(true); // 수2 (u_ 아님)
  });
});
