export const MAX_MONEY_CENTS = Number.MAX_SAFE_INTEGER;
export const MAX_INSTALLMENTS = 120;
export const BPS_DENOMINATOR = 10_000;

export function assertSafeCents(value: number, label = 'cents'): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`${label} deve ser um número finito`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} deve ser um inteiro seguro (centavos)`);
  }
  return value;
}

/**
 * Half-up simétrico: 0,5 afasta de zero. Usar só em dinheiro ≥ 0 neste pacote.
 */
export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('roundHalfUp: valor não finito');
  }
  return value >= 0 ? Math.round(value) : -Math.round(-value);
}

/**
 * Interpreta string pt-BR: milhar com ponto, decimal com vírgula, até 2 casas.
 * Ex.: `1.234,56` → 123456 centavos.
 */
export function parseBrlToCents(input: string): number {
  if (typeof input !== 'string') {
    throw new Error('valor deve ser string pt-BR');
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error('valor vazio');
  }

  const sign = trimmed.startsWith('-') ? -1 : 1;
  const unsigned = sign === -1 ? trimmed.slice(1) : trimmed;

  if (
    !/^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$/.test(unsigned) &&
    !/^\d+(?:,\d{1,2})?$/.test(unsigned)
  ) {
    throw new Error(`valor inválido: ${input}`);
  }
  if (unsigned.includes('.') && !/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(unsigned)) {
    throw new Error(`milhar inválido: ${input}`);
  }

  const [wholeRaw, fracRaw] = unsigned.split(',');
  const wholeDigits = (wholeRaw ?? '').replace(/\./g, '');
  if (wholeDigits.length === 0) {
    throw new Error(`valor inválido: ${input}`);
  }
  const frac = (fracRaw ?? '').padEnd(2, '0');
  if (frac.length > 2) {
    throw new Error('no máximo duas casas decimais');
  }

  const cents = Number.parseInt(`${wholeDigits}${frac}`, 10);
  if (!Number.isSafeInteger(cents)) {
    throw new Error('valor acima de MAX_SAFE_INTEGER');
  }
  return assertSafeCents(sign * cents, 'cents');
}

export function formatCentsToBrl(cents: number): string {
  assertSafeCents(cents, 'cents');
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.trunc(abs / 100);
  const frac = abs % 100;
  const wholeFmt = whole.toLocaleString('pt-BR');
  return `${sign}${wholeFmt},${String(frac).padStart(2, '0')}`;
}

/**
 * Reparte centavos em N parcelas. Parcelas 1..n-1 iguais (divisão inteira para
 * baixo); a última absorve o resto. Nenhuma parcela negativa se o total ≥ 0.
 */
export function splitCents(amountCents: number, parts: number): number[] {
  assertSafeCents(amountCents, 'amountCents');
  if (amountCents < 0) {
    throw new Error('amountCents não pode ser negativo');
  }
  if (!Number.isSafeInteger(parts) || parts < 1 || parts > MAX_INSTALLMENTS) {
    throw new Error(`parts deve ser um inteiro entre 1 e ${MAX_INSTALLMENTS}`);
  }

  const base = Math.trunc(amountCents / parts);
  const remainder = amountCents - base * parts;
  const result: number[] = [];
  for (let i = 0; i < parts; i += 1) {
    result.push(i === parts - 1 ? base + remainder : base);
  }
  return result;
}

/**
 * Percentual em basis points sobre o total, arredondado **uma vez** (half-up).
 * 1500 bps = 15%. Não chamar por parcela e somar.
 */
export function percentOfCents(amountCents: number, bps: number): number {
  assertSafeCents(amountCents, 'amountCents');
  if (amountCents < 0) {
    throw new Error('amountCents não pode ser negativo');
  }
  if (!Number.isSafeInteger(bps) || bps < 0 || bps > BPS_DENOMINATOR) {
    throw new Error(`bps deve ser inteiro 0–${BPS_DENOMINATOR} (10000 = 100%)`);
  }

  const n = BigInt(amountCents) * BigInt(bps);
  const d = BigInt(BPS_DENOMINATOR);
  const rounded = (n + 5000n) / d;
  return assertSafeCents(Number(rounded), 'percent');
}
