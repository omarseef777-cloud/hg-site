#!/usr/bin/env bash
# Build, then every check. Run from the scope-control folder:  bash tests/run_all.sh
# Needs Node with Playwright (+ Chromium) and Python 3.  Exit code 0 = safe to publish dist/.
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/build.js
node tools/patchmap.js
node tests/gate.js dist
node tests/dump_quantities.js dist tests/out
python3 -I tests/qty_reference.py data/scope.json tests/out/app_q.json tests/out/app_parts.json tests/out/qty_report.md > /dev/null
echo "PASS quantities match the method of measurement (report: tests/out/qty_report.md)"
node tests/sync_offline.js dist
echo "all checks passed · publish dist/index.html and the files in dist/d/"
