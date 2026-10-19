---
name: feature-from-issue
description: Transforma um item de tracker (Linear) em branch, spec em docs/specs, implementação e PR. Use ao implementar um item, começar uma feature ou abrir trabalho a partir do Linear.
---

# Item → spec → PR

Convenções: [docs/process/linear-conventions.md](../../../docs/process/linear-conventions.md). Receita: [task-recipe.md](../../../docs/process/task-recipe.md).

## Passos

1. Ler o item (MCP Linear). Um objetivo; dois = recorte.
2. Branch: `{{ISSUE_PREFIX}}-NN-slug`.
3. Copiar `docs/specs/_templates/{requirements,design,tasks}.md` → `docs/specs/<slug>/`.
4. REQ com **WHEN/SHALL**. Em `tasks.md`, o `it('nome')` **antes** do código.
5. Invariante (dinheiro, round-trip): `tests/property/` com `fast-check` e seed fixa. Exemplos em `tests/unit/`.
6. Depois de cada edição no núcleo: `pnpm test:loop`.
7. UI: skill `verify-app`. I/O: arquivo em `tests/integration/`, não “fica com o CI”.
8. `done` só com o `it` no arquivo (`pnpm harness:check`).
9. PR com [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md). Título `{{LINEAR_TEAM_KEY}}-NN …`.
10. Não feche o item no Markdown.

## Pronto

`pnpm check:quick` verde. Validation Log com o que **não** foi verificado. Revisor ≠ autor.
