#!/usr/bin/env bash
set -euo pipefail
AI_ROOT="$(cd "$(dirname "$0")/.." && pwd)/.local-ai"
AI_BIN="${OLLAMA_BIN:-$AI_ROOT/runtime/ollama}"
if [[ ! -x "$AI_BIN" ]]; then echo "Chạy npm run ai:setup trước."; exit 1; fi
export OLLAMA_HOST=127.0.0.1:11434
export OLLAMA_MODELS="$AI_ROOT/models"
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NO_CLOUD=1
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE=q8_0
export LLAMA_ARG_CACHE_RAM=128
exec "$AI_BIN" serve
