import path from 'node:path';
import { resolveSafeProjectPath } from '../src/common/utils/safe-path';

describe('safe path', () => {
  beforeEach(() => {
    process.env.CAT_ROBOT_PROJECT_ROOT = path.resolve(__dirname, '..', '..');
  });

  it('rejects absolute paths', () => {
    expect(() => resolveSafeProjectPath('C:/Windows/system.ini')).toThrow('相对路径');
  });

  it('rejects traversal outside project root', () => {
    expect(() => resolveSafeProjectPath('../secret.txt')).toThrow('路径越界');
  });

  it('allows project relative paths', () => {
    const target = resolveSafeProjectPath('assets/main_bg.png');
    expect(target.endsWith(path.join('assets', 'main_bg.png'))).toBe(true);
  });
});
