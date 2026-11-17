import { describe, it, expect } from 'vitest';
import { clamp, lerp, rad, bowAt, place } from '../works-wheel.js';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('clamps below the lower bound', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });
  it('clamps above the upper bound', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
  it('handles equal bounds', () => {
    expect(clamp(7, 3, 3)).toBe(3);
  });
});

describe('lerp', () => {
  it('returns a at t=0', () => expect(lerp(10, 20, 0)).toBe(10));
  it('returns b at t=1', () => expect(lerp(10, 20, 1)).toBe(20));
  it('returns the midpoint at t=0.5', () => expect(lerp(10, 20, 0.5)).toBe(15));
  it('extrapolates beyond 1', () => expect(lerp(0, 10, 2)).toBe(20));
});

describe('rad', () => {
  it('converts 0deg to 0rad', () => expect(rad(0)).toBe(0));
  it('converts 180deg to PI', () => expect(rad(180)).toBeCloseTo(Math.PI, 10));
  it('converts 90deg to PI/2', () => expect(rad(90)).toBeCloseTo(Math.PI / 2, 10));
});

describe('bowAt', () => {
  it('is 0 at the front of the drum (0deg)', () => {
    expect(bowAt(0, 1.82)).toBeCloseTo(0, 10);
  });
  it('is negative (bows inward) as cards rotate away', () => {
    expect(bowAt(40, 1.82)).toBeLessThan(0);
  });
  it('scales with the bow amount', () => {
    expect(bowAt(40, 2)).toBeLessThan(bowAt(40, 1));
  });
});

describe('place (transform builder)', () => {
  it('returns a non-empty transform string', () => {
    const t = place(0, 0, 100, 200, 10, 0);
    expect(typeof t).toBe('string');
    expect(t.length).toBeGreaterThan(0);
  });

  it('in ring mode (m=0) applies ring rotation and no drum rotation', () => {
    const t = place(90, 40, 100, 200, 10, 0);
    // m=0 -> drum terms vanish, ring terms are full
    expect(t).toContain('rotateZ(90deg)');
    expect(t).toContain('rotateX(0deg)');
    expect(t).toContain('translateZ(0px)');
  });

  it('in drum mode (m=1) applies drum rotation/depth and no ring rotation', () => {
    const t = place(90, 40, 100, 200, 10, 1);
    expect(t).toContain('rotateZ(0deg)');       // (1-m)*ringDeg = 0
    expect(t).toContain('rotateX(40deg)');      // m*drumDeg = 40
    expect(t).toContain('translateZ(200px)');   // m*drumR = 200
  });

  it('produces different transforms for ring vs drum mode', () => {
    expect(place(90, 40, 100, 200, 10, 0)).not.toBe(place(90, 40, 100, 200, 10, 1));
  });
});
