import { formatCentsToBrl, parseBrlToCents, splitCents } from '@project/money';

export type SplitRow = {
  index: number;
  cents: number;
  label: string;
};

export type SplitPreview = {
  cents: number;
  totalLabel: string;
  rows: SplitRow[];
};

export function previewSplit(amountBrl: string, parts: number): SplitPreview {
  const cents = parseBrlToCents(amountBrl);
  const amounts = splitCents(cents, parts);
  return {
    cents,
    totalLabel: formatCentsToBrl(cents),
    rows: amounts.map((partCents, i) => ({
      index: i + 1,
      cents: partCents,
      label: formatCentsToBrl(partCents),
    })),
  };
}
