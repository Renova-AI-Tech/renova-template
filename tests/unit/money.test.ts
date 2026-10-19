import { describe, expect, it } from 'vitest';
import {
  formatCentsToBrl,
  parseBrlToCents,
  percentOfCents,
  splitCents,
} from '../../packages/money/src/money.ts';

describe('parseBrlToCents / formatCentsToBrl', () => {
  it('lê e escreve o exemplo R$ 82.000,00', () => {
    expect(parseBrlToCents('82.000,00')).toBe(8_200_000);
    expect(formatCentsToBrl(8_200_000)).toBe('82.000,00');
  });

  it('aceita reais sem centavos e uma casa', () => {
    expect(parseBrlToCents('10')).toBe(1000);
    expect(parseBrlToCents('10,5')).toBe(1050);
  });

  it('rejeita centavos que não são inteiros seguros', () => {
    expect(() => parseBrlToCents('')).toThrow(/vazio/);
    expect(() => parseBrlToCents('10.00')).toThrow(/inválido|milhar/);
    expect(() => parseBrlToCents('10,123')).toThrow();
    expect(() => parseBrlToCents('abc')).toThrow(/inválido/);
  });
});

describe('splitCents', () => {
  it('coloca o resto na última parcela (R$ 100,00 / 3)', () => {
    expect(splitCents(10_000, 3)).toEqual([3333, 3333, 3334]);
  });

  it('uma parcela devolve o total', () => {
    expect(splitCents(199, 1)).toEqual([199]);
  });

  it('rejeita total negativo e parts inválido', () => {
    expect(() => splitCents(-1, 2)).toThrow(/negativo/);
    expect(() => splitCents(10, 0)).toThrow(/parts/);
    expect(() => splitCents(10, 1.5)).toThrow(/parts/);
  });
});

describe('percentOfCents', () => {
  it('15% de R$ 82.000,00 é 1.230.000 centavos', () => {
    expect(percentOfCents(8_200_000, 1500)).toBe(1_230_000);
  });

  it('não usa a soma dos arredondamentos por parcela como royalty total', () => {
    const total = 5;
    const bps = 1000;
    const once = percentOfCents(total, bps);
    const perPart = splitCents(total, 3).reduce((sum, part) => sum + percentOfCents(part, bps), 0);
    expect(once).toBe(1);
    expect(perPart).toBe(0);
    expect(once).not.toBe(perPart);
  });
});
