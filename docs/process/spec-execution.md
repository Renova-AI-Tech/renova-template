# Spec → PR

Proporcional: typo não ganha pasta. Feature que o agente implementa sozinho, sim. Conceito alinhado a Spec Kit / Kiro; **sem** o CLI deles.

## Item, pasta e PR

- Linear é a fonte do objetivo. “Para o desenvolvimento” aponta `docs/specs/<slug>/`.
- Branch: `{{ISSUE_PREFIX}}-NN-slug`.
- Título do PR cita **um** item. Merge fecha o item.

## Arquivos

Copie de [docs/specs/_templates/](../specs/_templates/requirements.md):

| Arquivo | Contém |
| --- | --- |
| `requirements.md` | Problem Statement, Out of Scope, Assumptions, REQ WHEN/SHALL, Traceability |
| `design.md` | Recorte, fronteiras, Validation Strategy |
| `tasks.md` | Ownership, Done when, Gate, Test (`it` + arquivo) |
| `handoff.md` | Só se o trabalho cruzar sessões |

Exemplo: [money-split](../specs/money-split/requirements.md).

## REQ

```
REQ-001. WHEN <condição observável>
         SHALL <comportamento observável>
```

## tasks.md (máquina lê)

```
## T-001 — título
- **Status:** todo | in_progress | done | blocked
- **Ownership:** path
- **Done when:** frase observável
- **Gate:** `pnpm test:loop`
- **Test:** `it('nome')` em `tests/unit/foo.test.ts`
```

`harness:check` recusa `done` sem o `it` no arquivo. Isso não prova que o teste distingue implementação errada — propriedades e o revisor fazem isso.

## Validation Log

```
## Validation Log
- Rodou: `pnpm test:loop`
- Não verificou: E2E (item não toca tela)
```
