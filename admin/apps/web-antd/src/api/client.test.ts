import { describe, expect, it } from 'vitest';
import source from './client.ts?raw';

describe('api client auth failures', () => {
  it('clears stale tokens and redirects to login on 401', () => {
    expect(source).toContain('api.interceptors.response.use');
    expect(source).toContain('response?.status === 401');
    expect(source).toContain("localStorage.removeItem('cat_robot_token')");
    expect(source).toContain("window.location.assign('/login')");
  });
});
