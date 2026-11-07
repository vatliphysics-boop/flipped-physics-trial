#!/usr/bin/env bash
set -euo pipefail
AI_ROOT="$(cd "$(dirname "$0")/.." && pwd)/.local-ai"
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Hãy cài Ollama từ https://ollama.com/download cho hệ điều hành này, rồi đặt OLLAMA_BIN tới chương trình ollama."
  exit 1
fi
mkdir -p "$AI_ROOT/runtime"
if [[ -x "$AI_ROOT/runtime/ollama" ]]; then
  echo "Đã có Ollama cục bộ. Chạy npm run ai:serve, rồi npm run ai:pull ở cửa sổ terminal khác."
  exit 0
fi
curl -fL --retry 2 https://github.com/ollama/ollama/releases/download/v0.35.1/ollama-darwin.tgz -o "$AI_ROOT/ollama-darwin.tgz"
echo "3137dbf28948ee844e0fb3e584d9b5de6879d73d9f0cb7eff3ad64930601d307  $AI_ROOT/ollama-darwin.tgz" | shasum -a 256 -c -
tar -xzf "$AI_ROOT/ollama-darwin.tgz" -C "$AI_ROOT/runtime"
echo "Đã cài. Chạy npm run ai:serve, rồi npm run ai:pull ở cửa sổ terminal khác."
