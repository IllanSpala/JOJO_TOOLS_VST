#!/usr/bin/env bash
set -euo pipefail

plugin="${1:-onde-e-que-eu-to}"
if [[ "$plugin" != "onde-e-que-eu-to" ]]; then echo "Plugin desconhecido: $plugin" >&2; exit 2; fi
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bundle="$root/build/linux/plugins/onde-e-que-eu-to/OndeEQueEuTo_artefacts/Debug/VST3/OndeEQueEuTo.vst3"
destination="${JOJO_VST3_DIR:-$HOME/.vst3}"
if [[ ! -d "$bundle" ]]; then echo "Bundle não encontrado: $bundle" >&2; exit 1; fi
mkdir -p "$destination/OndeEQueEuTo.vst3"
cp -a "$bundle/." "$destination/OndeEQueEuTo.vst3/"
echo "VST3 instalado em $destination/OndeEQueEuTo.vst3"
