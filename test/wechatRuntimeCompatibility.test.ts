import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

function listJavaScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listJavaScriptFiles(path) : entry.name.endsWith('.js') ? [path] : [];
  });
}

test('微信小游戏 CommonJS 产物不保留 await 语法', () => {
  const awaitFiles = listJavaScriptFiles(join(process.cwd(), 'dist'))
    .filter((file) => /\bawait\b/.test(readFileSync(file, 'utf8')));

  assert.deepEqual(awaitFiles, []);
});

test('微信小游戏产物不依赖开发者工具的 Babel class helper', () => {
  const classFiles = listJavaScriptFiles(join(process.cwd(), 'dist'))
    .filter((file) => /(^|\n)class\s+[A-Za-z_$]/.test(readFileSync(file, 'utf8')));

  assert.deepEqual(classFiles, []);
});
