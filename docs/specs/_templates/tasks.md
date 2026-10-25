# TASKS: {{FEATURE}}

- **Spec:** [requirements.md](./requirements.md)

## T-001 — <título>

- **Status:** todo
- **Ownership:** `packages/<area>` ou `apps/<area>`
- **Done when:** <frase observável>
- **Gate:** `pnpm test:loop`
- **Test:** `it('nome exatamente igual ao do arquivo')` em `tests/unit/<file>.test.ts`

## Gate Check Commands

```
pnpm test:loop
pnpm check:quick
```

`check:quick` local antes do push. Estenda testes existentes; não crie job/workflow.

## Validation Log

- Rodou:
- **Não verificou:**
