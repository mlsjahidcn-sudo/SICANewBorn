#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "🔍 Running validate..."
npm run ts-check
npm run lint:build
npm run i18n:check
npm run i18n:missing
npm test
echo "✅ Validate passed!"
