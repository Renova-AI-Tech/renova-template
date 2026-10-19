# ADR 0001 — Centavos inteiros

- **Status:** aceito
- **Data:** 2026-10-15

## Contexto

Agentes (e JS) erram conta em ponto flutuante de reais. Exemplos escolhidos não pegam resto e arredondamento.

## Decisão

Valores monetários neste sample são **centavos** `Number.isSafeInteger`. Percentual em bps arredonda half-up **uma vez** no total; depois `splitCents`.

## Consequências

- Recusar fração, `NaN` e overflow.
- Propriedades em `tests/property/`. Contraexemplo pinado em `tests/unit/`.
- Trocar por Decimal/BigInt é mudança de ADR, não “ajuste local”.
