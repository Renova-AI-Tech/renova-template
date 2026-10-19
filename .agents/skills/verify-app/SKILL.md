---
name: verify-app
description: Sobe o app e percorre o feature map com Playwright MCP. Use antes de declarar tela pronta, em bug de UI, ou quando o item toca jornada. Não substitua por teste jsdom/fake-api.
---

# verify-app

E2E é ground truth. Mãos + [feature-map.md](../../../docs/specs/feature-map.md).

## Subir

```bash
pnpm dev
```

http://127.0.0.1:43123 — [operations.md](../../../docs/process/operations.md).

## Andar

MCP Playwright em [`.mcp.json`](../../../.mcp.json) (`@playwright/mcp@0.0.83`).

Para cada jornada do mapa tocada pelo item: rota do mapa, `data-testid` estável, oráculo do mapa. Screenshot no passo que falha. Sem `waitForTimeout`. Sem recarregar até passar.

Sem MCP: `pnpm test:e2e` (mesmo mapa; CI não bloqueante).

## Validation Log

```
- UI: verify-app, jornada "<nome>", oráculo ok|falhou
- Não verificou: <outras jornadas>
```
