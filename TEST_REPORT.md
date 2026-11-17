# UI Test Report — Suchi Bansal Portfolio

**Scope:** unit + component tests for the interactive Recognition module
(`works-wheel.js`) and its data/asset wiring — the parts most recently built and
most prone to silent breakage (deck data, the render-loop performance fix, and
the 3D drum geometry).

| | |
|---|---|
| **Result** | ✅ **53 / 53 passing**, 0 failing |
| **Test files** | 3 |
| **Runner** | Vitest 5 + jsdom |
| **Coverage (`works-wheel.js`)** | 81.2% lines · 80.2% statements · 67.6% functions · 52.8% branches |
| **Run time** | ~5s |

Run it yourself:

```bash
npm test             # run once
npm run test:watch   # watch mode
npm run test:coverage # with coverage report
```

---

## What's tested

### 1. `tests/works-wheel.geometry.test.js` — pure geometry (18 tests)
The math behind the 3D drum, tested in isolation as pure functions:

- **`clamp`** — in-range, below/above bounds, equal bounds
- **`lerp`** — endpoints, midpoint, extrapolation
- **`rad`** — degree→radian conversion (0°, 90°, 180°)
- **`bowAt`** — zero at the drum front, bows inward as cards rotate away, scales with the bow factor
- **`place`** (transform builder) — correct output in ring mode (`m=0`) vs drum mode (`m=1`); verifies the rotateZ/rotateX/translateZ terms switch over correctly between the two layouts

### 2. `tests/recognition-data.test.js` — data & asset integrity (18 tests)
Guards the three Recognition cards and their documents:

- Exactly 3 items, each with the required display fields (title, image, tools, deliverables)
- **All 3 cards open a document** (no dead cards)
- Per deck (ReachifyMe · EcoVoyage · EcoCreds): valid label/title/pdf/slides, a valid `"W / H"` ratio when present, all slides are `.webp`
- **Every referenced PDF and every slide image actually exists on disk** — this catches a mis-typed path or a missing render before it ships

### 3. `tests/works-wheel.component.test.js` — component behavior (17 tests)
`initWorksWheel` driven in a jsdom DOM with controllable rAF/observer stubs:

- **Construction** — exposes the full control API; renders one card + one index entry per item; wires each card image to its item with `loading="lazy"` (below-the-fold perf); first item selected by default
- **Render-loop lifecycle** (the PDF-load fix) — schedules a frame while on-screen; `pause()` cancels the scheduled frame (frees the compositor so a deck modal paints instantly); `resume()` restarts it; `pause()` is idempotent; `destroy()` tears everything down
- **Render frame** — flushing a frame applies a 3D transform + z-index to every card; the loop re-schedules itself; navigating with `to()` converges the active index onto the target; a paused loop does **not** re-schedule even if a frame fires
- **Robustness** — `next`/`prev` keep the active index in range; an empty item list is handled; `null` container returns `null`

---

## Coverage detail (`works-wheel.js`)

```
% Stmts | % Branch | % Funcs | % Lines
  80.2  |   52.8   |  67.6   |  81.2
```

**Not yet unit-covered** (the remaining ~19% of lines): the raw pointer-drag,
mouse-wheel, and keyboard event handlers. These are interaction handlers best
exercised with real input events; they are currently validated through live
browser testing (see below) and are good candidates for a future Playwright
E2E pass.

---

## Complementary browser verification (manual, this session)

Some things can only be judged in a real engine (layout, compositing, image
decode) and were verified live on production (`www.suchibansal.com`):

- All three Recognition documents open in the PDF-style viewer and **paint
  instantly** — the EcoCreds certificate measured **~38 ms** to decode (down
  from the reported ~1 minute) after the render-loop pause fix.
- The 4:3 certificate renders undistorted (`object-fit: contain` + per-deck
  `--slide-ratio`); the 16:9 decks are unchanged.
- Deck viewer opens on slide 1, scroll-snaps between slides, counter tracks the
  current slide; the drum resumes animating after a deck closes.
- No site console errors.

---

## How to extend

- **E2E / interaction:** add Playwright tests for drag-to-cycle, wheel-scroll,
  keyboard arrows, and the full click-card → open-deck → scroll → close flow.
- **Deck viewer unit tests:** extract the inline `openDeckModal`/`closeDeckModal`
  logic from `index.html` into a module to unit-test counter formatting,
  slide-building, and the scroll-anchor reset in jsdom.
