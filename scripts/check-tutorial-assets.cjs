'use strict';
const path = require('node:path');
const { checkTutorialAssets } = require('./check-tutorial-assets-lib.cjs');

const result = checkTutorialAssets({ root: path.resolve(__dirname, '..') });
if (result.mode === 'LEGACY_FALLBACK' && result.valid) {
  console.log(`TUTORIAL_LEGACY_FALLBACK: ${result.reason}`);
  process.exit(0);
}
if (!result.valid) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}
console.log('TUTORIAL_ASSETS_OK');
