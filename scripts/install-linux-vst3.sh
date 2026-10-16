#!/usr/bin/env bash
set -euo pipefail

plugin="${1:-onde-e-que-eu-to}"
if [[ "$plugin" != "onde-e-que-eu-to" ]]; then echo "Plugin desconhecido: $plugin" >&2; exit 2; fi
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bundle="$root/build/linux/plugins/onde-e-que-eu-to/SeEncontre_artefacts/Debug/VST3/SeEncontre.vst3"
destination="${JOJO_VST3_DIR:-$HOME/.vst3}"
if [[ ! -d "$bundle" ]]; then echo "Bundle não encontrado: $bundle" >&2; exit 1; fi
mkdir -p "$destination/SeEncontre.vst3"
cp -a "$bundle/." "$destination/SeEncontre.vst3/"
# Keep the previous installation recoverable, outside the host's scan directory.
legacy="$destination/OndeEQueEuTo.vst3"
if [[ -d "$legacy" ]]; then
  backup_root="$(dirname "$destination")/jojo-tools-vst-backups"
  mkdir -p "$backup_root"
  backup="$(mktemp -d "$backup_root/rename.XXXXXX")"
  mv -- "$legacy" "$backup/"
  echo "Bundle anterior preservado em $backup"
fi
echo "VST3 instalado em $destination/SeEncontre.vst3"
