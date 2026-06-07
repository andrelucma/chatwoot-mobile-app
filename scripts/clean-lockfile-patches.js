#!/usr/bin/env node
'use strict';

// Removes patchedDependencies from pnpm-lock.yaml and strips patch_hash from version strings.
// This lets us apply patches via postinstall script instead, avoiding pnpm version
// incompatibilities between local (pnpm 10.x) and EAS build servers (pnpm 9.x).

const fs = require('fs');
const path = require('path');

const lockfilePath = path.join(__dirname, '..', 'pnpm-lock.yaml');
let content = fs.readFileSync(lockfilePath, 'utf8');

const before = content;

// Remove the patchedDependencies block (from the section header to the next top-level section)
content = content.replace(/\npatchedDependencies:\n[\s\S]*?\n(?=\w)/m, '\n');

// Remove all (patch_hash=<hex>) occurrences from version strings
content = content.replace(/\(patch_hash=[a-f0-9]+\)/g, '');

if (content === before) {
  console.log('No patch references found — lockfile already clean.');
} else {
  fs.writeFileSync(lockfilePath, content, 'utf8');
  console.log('Cleaned patch references from pnpm-lock.yaml');
}
