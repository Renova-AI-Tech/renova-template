# Convenções Linear

| Placeholder | Exemplo | Uso |
| --- | --- | --- |
| `{{LINEAR_TEAM}}` | `Renova / {{PROJECT}}` | nome do time |
| `{{LINEAR_TEAM_KEY}}` | `REN` | id do item (`REN-42`) |
| `{{ISSUE_PREFIX}}` | `ren` | prefixo da branch (minúsculo) |

- Um objetivo por item.
- Campos: **Depende de**, **Para o desenvolvimento** (`docs/specs/<slug>/`).
- Situação e responsável no Linear, não no Markdown.
- Branch: `{{ISSUE_PREFIX}}-NN-slug`.
- Título do PR: `{{LINEAR_TEAM_KEY}}-NN …`.
- Merge fecha o item do título. Não misture chore de harness com feature.

MCP: [`.mcp.json`](../../.mcp.json). `LINEAR_API_KEY` no ambiente, nunca no Git. Skill: [feature-from-issue](../../.agents/skills/feature-from-issue/SKILL.md).
