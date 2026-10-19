# Receita da tarefa

Copie arquivos. Detalhe: [spec-execution.md](spec-execution.md). Skill: [feature-from-issue](../../.agents/skills/feature-from-issue/SKILL.md).

## 1. Antes do código

1. Item Linear: um objetivo.
2. Copie `docs/specs/_templates/` → `docs/specs/<slug>/`.
3. Escreva o `it('…')` dono **antes** da implementação.
4. Invariante → `tests/property/` (`fast-check`, seed fixa). Exemplo → `tests/unit/`.
5. Restate o critério de pronto em `tasks.md`.

## 2. Camada e teste dono

| Camada | Pasta | Teste dono |
| --- | --- | --- |
| Função pura | `packages/*` | `tests/unit` + `tests/property` |
| App | `apps/*` | recorte sem DB no `test:loop` |
| SQL / webhook | I/O | `tests/integration/*.test.ts` — não pule |
| Tela | [feature-map](../specs/feature-map.md) | skill [verify-app](../../.agents/skills/verify-app/SKILL.md) |

Um dono por comportamento.

## 3. Loop

```
pnpm test:loop
pnpm check:quick
pnpm check:full
```

Depois de cada edição no núcleo: `test:loop`.

## 4. Encerrar

Validation Log (incluindo o que **não** foi verificado). PR com o template. Título cita o item.
