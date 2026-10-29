#!/bin/bash
set -euo pipefail

for f in \
  .release/v2part-00.b64 \
  .release/v2part-01.b64 \
  .release/v2part-02.b64 \
  .release/v2part-03.b64 \
  .release/v2part-04.b64 \
  .release/v2part-05-fixed.b64 \
  .release/v2part-06.b64
do
  base64 -d "$f" | tar -xzf -
done

npm install --no-audit --no-fund
npm test
npm run typecheck
npm run build
