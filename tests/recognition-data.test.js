import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { DEFAULT_WORKS } from '../works-wheel.js';

describe('DEFAULT_WORKS — structure', () => {
  it('has exactly 3 recognition items', () => {
    expect(DEFAULT_WORKS).toHaveLength(3);
  });

  it('every item has the required display fields', () => {
    for (const item of DEFAULT_WORKS) {
      expect(typeof item.title).toBe('string');
      expect(item.title.length).toBeGreaterThan(0);
      expect(typeof item.image).toBe('string');
      expect(typeof item.src).toBe('string');
      expect(Array.isArray(item.tools)).toBe(true);
      expect(Array.isArray(item.deliverables)).toBe(true);
      expect(item.deliverables.length).toBeGreaterThan(0);
    }
  });

  it('all three cards open a document (deck) — no dead cards', () => {
    const withDeck = DEFAULT_WORKS.filter((i) => i.deck);
    expect(withDeck).toHaveLength(3);
  });
});

describe('DEFAULT_WORKS — deck configuration', () => {
  for (const item of DEFAULT_WORKS) {
    describe(`deck: ${item.title.slice(0, 32)}`, () => {
      const deck = item.deck;

      it('has a label, title, pdf and a non-empty slides array', () => {
        expect(typeof deck.label).toBe('string');
        expect(typeof deck.title).toBe('string');
        expect(typeof deck.pdf).toBe('string');
        expect(Array.isArray(deck.slides)).toBe(true);
        expect(deck.slides.length).toBeGreaterThan(0);
      });

      it('uses a valid "W / H" ratio when one is specified', () => {
        if (deck.ratio !== undefined) {
          expect(deck.ratio).toMatch(/^\s*\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?\s*$/);
        }
      });

      it('every slide path is a .webp', () => {
        for (const s of deck.slides) expect(s).toMatch(/\.webp$/);
      });

      it('the referenced PDF file exists on disk', () => {
        expect(existsSync(deck.pdf)).toBe(true);
      });

      it('every referenced slide image exists on disk', () => {
        for (const s of deck.slides) {
          expect(existsSync(s), `missing slide: ${s}`).toBe(true);
        }
      });
    });
  }
});
