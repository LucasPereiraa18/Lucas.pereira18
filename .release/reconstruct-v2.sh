#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
TMP="$(mktemp -d)"
cat \
  "$ROOT/.release/v2part-00.b64" \
  "$ROOT/.release/v2part-01.b64" \
  "$ROOT/.release/v2part-02.b64" \
  "$ROOT/.release/v2part-03.b64" \
  "$ROOT/.release/v2part-04.b64" \
  "$ROOT/.release/v2part-05-fixed.b64" \
  "$ROOT/.release/v2part-06.b64" \
  | tr -d '\r\n' | base64 -d > "$TMP/ponto-lider-v2.tar.gz"
mkdir -p "$TMP/src"
tar -xzf "$TMP/ponto-lider-v2.tar.gz" -C "$TMP/src"
SRC_ROOT="$(dirname "$(find "$TMP/src" -type f -name package.json -not -path '*/node_modules/*' | head -1)")"
if [ ! -f "$SRC_ROOT/package.json" ]; then
  echo 'Ponto Líder v2: package.json não encontrado após reconstrução.' >&2
  exit 1
fi
# preserva a pasta .release para auditoria, mas substitui o app pelo release v2.
find "$ROOT" -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.release' -exec rm -rf {} +
cp -a "$SRC_ROOT"/. "$ROOT"/
mkdir -p "$ROOT/app/api/version"
cat > "$ROOT/app/api/version/route.ts" <<'EOF'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    app: "Ponto Líder",
    version: "2.0.0",
    module: "Líder Pulse",
    status: "online",
  });
}
EOF
echo 'Ponto Líder v2 reconstruído com sucesso.'
