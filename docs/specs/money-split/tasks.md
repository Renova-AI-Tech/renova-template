# TASKS: Repartir valores (sample)

- **Spec:** [requirements.md](./requirements.md)

## T-001 — Conservação ao repartir

- **Status:** done
- **Ownership:** `packages/money`
- **Done when:** para qualquer total ≥ 0 e N em 1–12, soma das parcelas = total
- **Gate:** `pnpm test:loop`
- **Test:** `it('conserva o total em centavos ao repartir')` em `tests/property/money.property.test.ts`

## T-002 — Ida e volta BRL

- **Status:** done
- **Ownership:** `packages/money`
- **Done when:** `parse(format(cents)) === cents`
- **Gate:** `pnpm test:loop`
- **Test:** `it('ida e volta BRL ↔ centavos')` em `tests/property/money.property.test.ts`

## T-003 — Percentual uma vez no total

- **Status:** done
- **Ownership:** `packages/money`
- **Done when:** royalties = `percentOfCents(total, bps)` e a soma das parcelas desse valor = ele mesmo
- **Gate:** `pnpm test:loop`
- **Test:** `it('royalties arredondam uma vez no total, não por parcela')` em `tests/property/money.property.test.ts`

## T-004 — Recusa de centavo inválido

- **Status:** done
- **Ownership:** `packages/money`
- **Done when:** string vazia, milhar inválido e não-número lançam
- **Gate:** `pnpm test:loop`
- **Test:** `it('rejeita centavos que não são inteiros seguros')` em `tests/unit/money.test.ts`

## T-005 — Jornada na tela

- **Status:** done
- **Ownership:** `apps/sample` + `tests/e2e`
- **Done when:** feature map jornada 1 verde no Playwright
- **Gate:** `pnpm test:e2e`
- **Test:** `it('reparte R$ 100,00 em 3 parcelas e mostra o resto na última')` em `tests/e2e/split.spec.ts`

## Gate Check Commands

```
pnpm test:loop
pnpm check:quick
```

## Validation Log

- Rodou: `pnpm test:loop`, `pnpm harness:check`, `pnpm harness:test`, `pnpm check:quick`.
- **Não verificou:** pagamento real, persistência, a11y completa.
