#!/usr/bin/env bash
set -euo pipefail

plugin="${1:-onde-e-que-eu-to}"
if [[ "$plugin" != "onde-e-que-eu-to" ]]; then
  echo "Plugin desconhecido: $plugin" >&2
  exit 2
fi
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for tool in cmake ninja npm; do command -v "$tool" >/dev/null || { echo "Ferramenta ausente: $tool" >&2; exit 1; }; done
cmake -S "$root" -B "$root/build/linux" -G Ninja -DCMAKE_BUILD_TYPE=Debug
cmake --build "$root/build/linux" --parallel "${JOJO_BUILD_JOBS:-4}"
echo "Build concluído para $plugin."
