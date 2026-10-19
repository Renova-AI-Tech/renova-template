# DESIGN: Repartir valores (sample)

- **Spec:** [requirements.md](./requirements.md)

## Recorte

- Puro: `packages/money/src/money.ts`
- UI: `apps/sample` chama `previewSplit` (não reimplementa conta)
- Testes: `tests/unit`, `tests/property`, `tests/e2e`
- Mapa: [feature-map.md](../feature-map.md)

## Decisões

| ID | Decisão | Alternativa descartada |
| --- | --- | --- |
| DES-001 | Centavos `number` inteiro seguro | BigInt em toda API |
| DES-002 | Resto sempre na última parcela | Distribuir 1 centavo nas primeiras |
| DES-003 | `percentOfCents` half-up inteiro no total | Somar arredondamento por parcela |

## Validation Strategy

- Propriedades com `fast-check` seed `20261015`, 200 runs.
- Contraexemplo pinado: 5 centavos, 10%, 3 parcelas — uma vez = 1, soma por parte = 0.
- E2E da jornada 1 fora do `check:quick`.
