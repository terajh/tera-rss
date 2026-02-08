#!/bin/bash
set -e
cd "$(dirname "$0")/.."
deno run --allow-read --allow-write src/merge.ts
