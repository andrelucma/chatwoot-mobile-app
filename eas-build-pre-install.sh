#!/bin/bash
# EAS Build pre-install hook
# Allow pnpm to regenerate lockfile if there's a config mismatch
# (needed because CRLF/LF differences in patch hashes between Windows dev and Linux CI)
echo "frozen-lockfile=false" >> .npmrc
