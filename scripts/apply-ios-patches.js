#!/usr/bin/env node
'use strict';

// iOS-only patches — skip on Windows (Android builds)
if (process.platform === 'win32') {
  process.exit(0);
}

const { execSync } = require('child_process');
const { existsSync } = require('fs');

const patches = [
  { file: 'patches/ffmpeg-kit-react-native.patch', dir: 'node_modules/ffmpeg-kit-react-native' },
  { file: 'patches/react-native-ios-utilities@5.2.0.patch', dir: 'node_modules/react-native-ios-utilities' },
];

for (const { file, dir } of patches) {
  if (!existsSync(dir)) {
    console.log(`[patch] skipped (not found): ${dir}`);
    continue;
  }
  try {
    execSync(`git apply --directory="${dir}" "${file}"`, { stdio: 'pipe' });
    console.log(`[patch] applied: ${file}`);
  } catch {
    console.log(`[patch] already applied or skipped: ${file}`);
  }
}
