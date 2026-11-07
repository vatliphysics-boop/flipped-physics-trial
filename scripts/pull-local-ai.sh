#!/usr/bin/env bash
set -euo pipefail
AI_ROOT="$(cd "$(dirname "$0")/.." && pwd)/.local-ai"
AI_BIN="${OLLAMA_BIN:-$AI_ROOT/runtime/ollama}"
if [[ ! -x "$AI_BIN" ]]; then echo "Chạy npm run ai:setup trước."; exit 1; fi
export OLLAMA_HOST=127.0.0.1:11434
exec "$AI_BIN" pull "${LOCAL_AI_MODEL:-qwen3:4b-instruct-2507-q4_K_M}"
