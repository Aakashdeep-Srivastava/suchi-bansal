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

  it('every card opens something — a deck, a rich project, or a link (no dead cards)', () => {
    const live = DEFAULT_WORKS.filter((i) => i.deck || i.project || i.link);
    expect(live).toHaveLength(3);
  });
});

// A deck can live at the top level (legacy) or nested inside a rich project card.
const deckItems = DEFAULT_WORKS
  .map((i) => ({ title: i.title, deck: i.deck || (i.project && i.project.deck) }))
  .filter((i) => i.deck);

describe('DEFAULT_WORKS — deck configuration', () => {
  for (const item of deckItems) {
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

describe('DEFAULT_WORKS — rich project cards (summary + key details + deck/certificate)', () => {
  for (const item of DEFAULT_WORKS.filter((i) => i.project)) {
    describe(`project: ${item.title.slice(0, 32)}`, () => {
      const p = item.project;

      it('has a title, description and at least 3 highlight points', () => {
        expect(typeof p.title).toBe('string');
        expect(typeof p.description).toBe('string');
        expect(p.description.length).toBeGreaterThan(40);
        expect(Array.isArray(p.highlights)).toBe(true);
        expect(p.highlights.length).toBeGreaterThanOrEqual(3);
      });

      it('opens a destination — a deck, a certificate, or a live link (no dead modal)', () => {
        const opensSomething =
          (p.deck && Array.isArray(p.deck.slides) && p.deck.slides.length) ||
          (p.certificate && p.certificate.image) ||
          (typeof p.link === 'string' && p.link.length);
        expect(opensSomething).toBeTruthy();
      });

      it('uses an https URL when a live link is specified', () => {
        if (p.link !== undefined) {
          expect(p.link).toMatch(/^https:\/\//);
        }
      });

      it('has a deck label whenever it carries a deck', () => {
        if (p.deck) {
          expect(typeof p.deckLabel).toBe('string');
          expect(p.deckLabel.length).toBeGreaterThan(0);
        }
      });

      it('has a certificate whose image and PDF exist on disk, when one is specified', () => {
        if (p.certificate) {
          expect(p.certificate.image).toMatch(/\.webp$/);
          expect(existsSync(p.certificate.image), `missing cert image: ${p.certificate.image}`).toBe(true);
          expect(existsSync(p.certificate.pdf), `missing cert pdf: ${p.certificate.pdf}`).toBe(true);
          if (p.certificate.ratio !== undefined) {
            expect(p.certificate.ratio).toMatch(/^\s*\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?\s*$/);
          }
        }
      });
    });
  }
});
