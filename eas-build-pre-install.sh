#!/bin/bash
set -e

echo "=== EAS Pre-install Hook ==="
echo "pnpm version: $(pnpm --version)"
echo "Regenerating lockfile with current environment hashes..."

# Run without frozen-lockfile to update patch hashes in lockfile to match this macOS environment.
# EAS will then run its own 'pnpm install --frozen-lockfile' with the updated lockfile.
pnpm install --no-frozen-lockfile

echo "=== Pre-install Hook complete ==="
