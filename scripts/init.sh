#!/usr/bin/env bash
# Sobe o ambiente do zero (clone, Cursor Cloud, Claude remoto). Sem secret de produção.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare pnpm@10.33.4 --activate
  else
    echo "precisa Node 22+ com corepack/pnpm" >&2
    exit 1
  fi
fi

pnpm install

mkdir -p .claude .cursor
if [[ ! -e .claude/skills ]]; then
  ln -s ../.agents/skills .claude/skills
fi
if [[ ! -e .cursor/mcp.json ]]; then
  ln -s ../.mcp.json .cursor/mcp.json
fi

if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
fi

echo "init ok"
echo "  app:     pnpm dev            → http://127.0.0.1:43123"
echo "  loop:    pnpm test:loop"
echo "  gate:    pnpm check:quick"
echo "  Linear:  {{LINEAR_TEAM}} — docs/process/linear-conventions.md"
