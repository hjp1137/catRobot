import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from './vite.config';

describe('vite dev server config', () => {
  it('uses port 5602 to avoid local Vben port conflicts', () => {
    const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

    expect(config.server?.port).toBe(5602);
    expect(packageJson.scripts.dev).toContain('--port 5602');
  });
});
