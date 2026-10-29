#!/bin/bash
set -euo pipefail

for f in .release/v2part-*.b64; do
  base64 -d "$f" | tar -xzf -
done

npm install --no-audit --no-fund
npm test
npm run typecheck
npm run build
