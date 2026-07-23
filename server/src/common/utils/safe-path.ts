import path from 'node:path';

export function projectRoot(): string {
  return path.resolve(process.env.CAT_ROBOT_PROJECT_ROOT ?? '..');
}

export function resolveSafeProjectPath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) throw new Error('只允许项目内相对路径');
  const root = projectRoot();
  const target = path.resolve(root, relativePath);
  if (!target.startsWith(root + path.sep) && target !== root) throw new Error('路径越界');
  return target;
}
