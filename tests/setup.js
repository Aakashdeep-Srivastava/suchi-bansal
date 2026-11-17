/**
 * Test environment shims.
 *
 * jsdom does not implement the browser scheduling / observation APIs that
 * works-wheel.js relies on, so we provide controllable stubs here:
 *  - requestAnimationFrame / cancelAnimationFrame are backed by a manual
 *    registry (globalThis.__raf) so tests can assert exactly when the render
 *    loop is or isn't scheduled, without any frame ever auto-firing.
 *  - IntersectionObserver / ResizeObserver are inert no-ops.
 *  - matchMedia reports "no preference".
 */

globalThis.__raf = { pending: new Map(), seq: 0 };

globalThis.requestAnimationFrame = (cb) => {
  const id = ++globalThis.__raf.seq;
  globalThis.__raf.pending.set(id, cb);
  return id;
};

globalThis.cancelAnimationFrame = (id) => {
  globalThis.__raf.pending.delete(id);
};

// Count of currently-scheduled frames — the signal for "is the loop running?"
globalThis.rafPendingCount = () => globalThis.__raf.pending.size;

globalThis.IntersectionObserver = class {
  constructor(cb) { this._cb = cb; }
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  });
}
if (typeof window !== 'undefined') window.matchMedia = globalThis.matchMedia;
