import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  assertSafeCents,
  formatCentsToBrl,
  parseBrlToCents,
  percentOfCents,
  splitCents,
} from '../../packages/money/src/money.ts';

const seed = 20261015;
const centsArb = fc.integer({ min: 0, max: 50_000_00 });
const partsArb = fc.integer({ min: 1, max: 12 });
const bpsArb = fc.integer({ min: 0, max: 10_000 });

describe('propriedades de dinheiro', () => {
  it('conserva o total em centavos ao repartir', () => {
    fc.assert(
      fc.property(centsArb, partsArb, (amount, parts) => {
        const splits = splitCents(amount, parts);
        const sum = splits.reduce((acc, n) => acc + n, 0);
        expect(sum).toBe(amount);
      }),
      { numRuns: 200, seed },
    );
  });

  it('resto na última parcela; prefixo uniforme; nada negativo', () => {
    fc.assert(
      fc.property(centsArb, partsArb, (amount, parts) => {
        const splits = splitCents(amount, parts);
        expect(splits).toHaveLength(parts);
        for (const part of splits) {
          expect(part).toBeGreaterThanOrEqual(0);
          expect(Number.isSafeInteger(part)).toBe(true);
        }
        if (parts === 1) {
          expect(splits[0]).toBe(amount);
          return;
        }
        const head = splits[0];
        expect(head).toBeDefined();
        for (let i = 0; i < parts - 1; i += 1) {
          expect(splits[i]).toBe(head);
        }
        expect(splits[parts - 1]).toBe(amount - (parts - 1) * (head ?? 0));
      }),
      { numRuns: 200, seed },
    );
  });

  it('ida e volta BRL ↔ centavos', () => {
    fc.assert(
      fc.property(fc.integer({ min: -50_000_00, max: 50_000_00 }), (cents) => {
        const formatted = formatCentsToBrl(cents);
        expect(parseBrlToCents(formatted)).toBe(cents);
      }),
      { numRuns: 200, seed },
    );
  });

  it('rejeita centavos que não são inteiros seguros (propriedade)', () => {
    const bad = fc.oneof(
      fc.constant(Number.NaN),
      fc.constant(Number.POSITIVE_INFINITY),
      fc.double({ min: 0.1, max: 99.9, noNaN: true }).filter((n) => !Number.isInteger(n)),
      fc.constant(Number.MAX_SAFE_INTEGER + 2),
    );
    fc.assert(
      fc.property(bad, (value) => {
        expect(() => assertSafeCents(value, 'cents')).toThrow();
      }),
      { numRuns: 50, seed },
    );
  });

  it('royalties arredondam uma vez no total, não por parcela', () => {
    fc.assert(
      fc.property(centsArb, partsArb, bpsArb, (amount, parts, bps) => {
        const once = percentOfCents(amount, bps);
        const splitRoyalties = splitCents(once, parts);
        expect(splitRoyalties.reduce((acc, n) => acc + n, 0)).toBe(once);
        expect(Number.isSafeInteger(once)).toBe(true);
      }),
      { numRuns: 200, seed },
    );
  });
});
