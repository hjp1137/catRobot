import { describe, expect, it } from 'vitest';
import source from './LoginView.vue?raw';

describe('LoginView', () => {
  it('binds Ant Design form validation to the login model', () => {
    expect(source).toContain('<a-form :model="form"');
    expect(source).toContain('v-model:value="form.username"');
    expect(source).toContain('v-model:value="form.password"');
  });
});
