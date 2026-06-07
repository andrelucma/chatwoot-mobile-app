#!/bin/bash
# EAS Build pre-install hook
# EAS has pnpm 9.15.9 pre-installed but our lockfile was generated with pnpm 10.11.0.
# Upgrade pnpm to the correct version via corepack before EAS runs pnpm install.
echo "Upgrading pnpm to 10.11.0..."
npm install -g pnpm@10.11.0
echo "pnpm version: $(pnpm --version)"
