# SPEC: Repartir valores (sample)

- **Item:** {{LINEAR_TEAM_KEY}}-0 (exemplo do template)
- **Pasta:** `docs/specs/money-split/`
- **Status:** done (didático)

## Problem Statement

Agentes entregam conta de dinheiro com exemplos que eles mesmos inventam. Precisamos de um núcleo puro com propriedades e de uma tela mínima para o E2E não ser hipotético.

## Out of Scope

- Gateway de pagamento, webhook, persistência, autenticação.
- Regras de um cliente.

## Assumptions

- Moeda de demonstração: BRL pt-BR.
- Centavos cabem em `Number.isSafeInteger`.

## Requirements

### REQ-001. WHEN um valor em centavos ≥ 0 é repartido em N parcelas (1–120)
SHALL a soma das parcelas ser exatamente o total e as primeiras N−1 parcelas serem iguais, com o resto na última.

### REQ-002. WHEN o valor é informado como string pt-BR (`1.234,56`)
SHALL a conversão para centavos e de volta à string preservar o número.

### REQ-003. WHEN um percentual em bps é aplicado
SHALL o arredondamento half-up acontecer **uma vez** no total, não por parcela somada.

### REQ-004. WHEN a entrada não é centavo inteiro seguro (NaN, fração, overflow)
SHALL a função recusar com erro — nunca silenciar.

### REQ-005. WHEN um usuário abre a tela de sample e reparte R$ 100,00 em 3
SHALL ver três parcelas 33,33 / 33,33 / 33,34.

## Requirement Traceability

| REQ | Passo | Teste dono |
| --- | --- | --- |
| REQ-001 | T-001 | `it('conserva o total em centavos ao repartir')` em `tests/property/money.property.test.ts` |
| REQ-002 | T-002 | `it('ida e volta BRL ↔ centavos')` em `tests/property/money.property.test.ts` |
| REQ-003 | T-003 | `it('royalties arredondam uma vez no total, não por parcela')` em `tests/property/money.property.test.ts` |
| REQ-004 | T-004 | `it('rejeita centavos que não são inteiros seguros')` em `tests/unit/money.test.ts` |
| REQ-005 | T-005 | jornada em `tests/e2e/split.spec.ts` (CI não bloqueante) |
