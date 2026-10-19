# Feature map

Ponto de vista do usuário. Skill [verify-app](../../.agents/skills/verify-app/SKILL.md) anda estas linhas. Playwright usa os mesmos `data-testid`.

App: `pnpm dev` → http://127.0.0.1:43123

| Jornada | Como chegar | Seletores | Oráculo | Pegadinha |
| --- | --- | --- | --- | --- |
| Repartir R$ 100,00 em 3x | `/` → valor e parcelas → Repartir | `amount-input`, `parts-input`, `split-button`, `installment-row`, `total-cents` | 3 linhas 33,33 / 33,33 / 33,34; `total-cents` = `10000` | pt-BR (`100,00`, não `100.00`) |
| Valor inválido | `/` → valor em branco → Repartir | `split-error`, `empty-state` | alerta visível; lista some | espaços-só também são vazios |

Enter no form submete. Sem atalho extra neste sample. Quando o produto crescer, uma linha por jornada ouro — não todos os ramos.
