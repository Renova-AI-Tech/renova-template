import { describe, expect, it } from 'vitest';
import { previewSplit } from '../../apps/sample/src/split-preview.ts';

describe('previewSplit', () => {
  it('reparte R$ 100,00 em 3 parcelas com resto no fim', () => {
    const preview = previewSplit('100,00', 3);
    expect(preview.cents).toBe(10_000);
    expect(preview.rows.map((row) => row.cents)).toEqual([3333, 3333, 3334]);
    expect(preview.rows[2]?.label).toBe('33,34');
  });

  it('propaga valor inválido', () => {
    expect(() => previewSplit('', 2)).toThrow(/vazio/);
  });
});
