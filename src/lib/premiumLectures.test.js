import { describe, it, expect } from 'vitest';
import { slugForLecture, PREMIUM_LECTURES } from './premiumLectures';

describe('premiumLectures SSOT', () => {
  it('maps known lectures to clean ascii slugs', () => {
    expect(slugForLecture('고차방정식')).toBe('higher_order_eq');
    expect(slugForLecture('미적분_정적분')).toBe('calc_def_integral');
    expect(slugForLecture('함수의연속')).toBe('continuity');
  });
  it('returns null for unknown or removed lectures', () => {
    expect(slugForLecture('삼각함수그래프')).toBeNull();
    expect(slugForLecture('nope')).toBeNull();
    expect(slugForLecture(null)).toBeNull();
  });
  it('all 34 slugs are unique lowercase ascii', () => {
    const slugs = Object.values(PREMIUM_LECTURES).map((v) => v.slug);
    expect(slugs.length).toBe(34);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((s) => expect(s).toMatch(/^[a-z0-9_]+$/));
  });
});
