import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initWorksWheel, DEFAULT_WORKS } from '../works-wheel.js';

let container;
let instance;

beforeEach(() => {
  globalThis.__raf.pending.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (instance) { instance.destroy(); instance = null; }
  container.remove();
});

describe('initWorksWheel — DOM construction', () => {
  beforeEach(() => {
    instance = initWorksWheel(container, { items: DEFAULT_WORKS });
  });

  it('returns a control API', () => {
    for (const fn of ['to', 'next', 'prev', 'getActive', 'pause', 'resume', 'destroy']) {
      expect(typeof instance[fn]).toBe('function');
    }
  });

  it('renders one card per item', () => {
    const cards = container.querySelectorAll('[id^="works-wheel-"]');
    expect(cards).toHaveLength(DEFAULT_WORKS.length);
  });

  it('renders a side index entry per item', () => {
    const buttons = container.querySelectorAll('ol button');
    expect(buttons).toHaveLength(DEFAULT_WORKS.length);
  });

  it('wires each card image to its item and defers loading', () => {
    const imgs = container.querySelectorAll('[id^="works-wheel-"] img');
    expect(imgs).toHaveLength(DEFAULT_WORKS.length);
    imgs.forEach((img, i) => {
      expect(img.getAttribute('src')).toBe(DEFAULT_WORKS[i].image);
      // perf: thumbnails are below the fold, so loading is deferred.
      // (Asserting the IDL property — browsers reflect it; jsdom keeps it as-is.)
      expect(img.loading).toBe('lazy');
    });
  });

  it('marks the first item selected by default', () => {
    expect(instance.getActive()).toBe(0);
    expect(container.querySelector('#works-wheel-0').getAttribute('aria-selected')).toBe('true');
  });
});

describe('initWorksWheel — render-loop lifecycle (the PDF-load fix)', () => {
  beforeEach(() => {
    instance = initWorksWheel(container, { items: DEFAULT_WORKS });
  });

  it('schedules a frame on boot (loop running while in view)', () => {
    expect(globalThis.rafPendingCount()).toBeGreaterThan(0);
  });

  it('pause() cancels the scheduled frame (frees the compositor)', () => {
    expect(globalThis.rafPendingCount()).toBeGreaterThan(0);
    instance.pause();
    expect(globalThis.rafPendingCount()).toBe(0);
  });

  it('resume() restarts the loop', () => {
    instance.pause();
    expect(globalThis.rafPendingCount()).toBe(0);
    instance.resume();
    expect(globalThis.rafPendingCount()).toBeGreaterThan(0);
  });

  it('pause() is idempotent and resume() after pause is safe', () => {
    instance.pause();
    instance.pause();
    expect(globalThis.rafPendingCount()).toBe(0);
    instance.resume();
    expect(globalThis.rafPendingCount()).toBeGreaterThan(0);
  });

  it('destroy() stops the loop and leaves nothing scheduled', () => {
    instance.destroy();
    expect(globalThis.rafPendingCount()).toBe(0);
    instance = null; // already destroyed
  });
});

// Manually execute every scheduled animation frame exactly once.
function flushFrame() {
  const callbacks = [...globalThis.__raf.pending.values()];
  globalThis.__raf.pending.clear();
  callbacks.forEach((cb) => cb(0));
}

describe('initWorksWheel — render frame', () => {
  beforeEach(() => {
    instance = initWorksWheel(container, { items: DEFAULT_WORKS });
  });

  it('positions every card with a 3D transform on each frame', () => {
    flushFrame();
    const cards = container.querySelectorAll('[id^="works-wheel-"]');
    cards.forEach((card) => {
      expect(card.style.transform).toContain('translateX');
      expect(card.style.transform).toContain('rotateX');
      expect(card.style.zIndex).not.toBe('');
    });
  });

  it('keeps re-scheduling itself while running', () => {
    flushFrame();
    expect(globalThis.rafPendingCount()).toBeGreaterThan(0); // next frame queued
  });

  it('settles onto the drum when navigated (active follows target)', () => {
    instance.to(3); // move toward the last card
    for (let i = 0; i < 120; i++) flushFrame(); // let the easing converge
    expect(instance.getActive()).toBe(DEFAULT_WORKS.length - 1);
  });

  it('stops re-scheduling after pause, even if a frame is flushed', () => {
    instance.pause();
    flushFrame();
    expect(globalThis.rafPendingCount()).toBe(0);
  });
});

describe('initWorksWheel — navigation', () => {
  beforeEach(() => {
    instance = initWorksWheel(container, { items: DEFAULT_WORKS });
  });

  it('exposes next/prev without throwing and keeps active in range', () => {
    expect(() => { instance.next(); instance.next(); instance.prev(); }).not.toThrow();
    const active = instance.getActive();
    expect(active).toBeGreaterThanOrEqual(0);
    expect(active).toBeLessThan(DEFAULT_WORKS.length);
  });

  it('handles an empty item list gracefully', () => {
    const c2 = document.createElement('div');
    document.body.appendChild(c2);
    const inst2 = initWorksWheel(c2, { items: [] });
    expect(inst2).not.toBeNull();
    inst2.destroy();
    c2.remove();
  });

  it('returns null when given no container', () => {
    expect(initWorksWheel(null)).toBeNull();
  });
});
