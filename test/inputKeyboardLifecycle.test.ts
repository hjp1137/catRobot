import test from 'node:test';
import assert from 'node:assert/strict';
import { Input } from '../dist/engine/Input.js';

test('键盘输入支持可重复安全绑定、空code并在销毁后解除监听', () => {
  const listeners = new Map<string, Set<(event: unknown) => void>>();
  (globalThis as any).window = { document: {
    addEventListener(type: string, fn: (event: unknown) => void) { (listeners.get(type) ?? listeners.set(type, new Set()).get(type)!).add(fn); },
    removeEventListener(type: string, fn: (event: unknown) => void) { listeners.get(type)?.delete(fn); },
  } };
  const input = new Input();
  input.attachKeyboard(); input.attachKeyboard();
  assert.equal(listeners.get('keydown')?.size, 1);
  for (const listener of listeners.get('keydown') ?? []) listener({ key: undefined, code: undefined });
  assert.equal(input.moveX, 0);
  input.disposeKeyboard();
  assert.equal(listeners.get('keydown')?.size, 0);
  delete (globalThis as any).window;
});
