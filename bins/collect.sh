#!/bin/bash
set -e
cd "$(dirname "$0")/.."
deno run --allow-net --allow-read --allow-write src/collect.ts
