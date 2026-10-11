#!/usr/bin/env bash
set -euo pipefail

plugin="${1:-onde-e-que-eu-to}"
if [[ "$plugin" != "onde-e-que-eu-to" ]]; then echo "Plugin desconhecido: $plugin" >&2; exit 2; fi
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
binary="$root/build/linux/plugins/onde-e-que-eu-to/OndeEQueEuTo_artefacts/Debug/Standalone/OndeEQueEuTo"
if [[ ! -x "$binary" ]]; then echo "Standalone não encontrado: $binary" >&2; exit 1; fi
exec "$binary"
