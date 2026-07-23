import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

function isIgnoredFolder(relPath: string, folderRules: string[]): boolean {
  const parts = relPath.split('/').filter(Boolean);
  return folderRules.some(rule => parts.includes(rule) || relPath === rule || relPath.startsWith(rule + '/'));
}

function getAllFiles(dir: string, baseDir: string = dir, folderRules: string[] = []): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!isIgnoredFolder(relPath, folderRules)) {
        results = results.concat(getAllFiles(fullPath, baseDir, folderRules));
      }
    } else {
      results.push(relPath);
    }
  }
  return results;
}

test('微信发布包排除规则与完整性自动校验', () => {
  const rootDir = path.resolve(process.cwd());
  const configPath = path.join(rootDir, 'project.config.json');
  assert.ok(fs.existsSync(configPath), 'project.config.json 必须存在');
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const ignoreRules = config.packOptions?.ignore || [];
  
  const folderRules = ignoreRules.filter((rule: any) => rule.type === 'folder').map((rule: any) => rule.value.replace(/\\/g, '/'));
  const allFiles = getAllFiles(rootDir, rootDir, folderRules);
  const allowedFiles: string[] = [];
  let allowedBytes = 0;

  for (const file of allFiles) {
    let isIgnored = false;
    const parts = file.split('/');
    
    for (const rule of ignoreRules) {
      const val = rule.value.replace(/\\/g, '/');
      if (rule.type === 'folder') {
        if (parts.includes(val) || file.startsWith(val + '/')) {
          isIgnored = true;
          break;
        }
      } else if (rule.type === 'file') {
        if (path.basename(file) === val || file === val) {
          isIgnored = true;
          break;
        }
      } else if (rule.type === 'glob') {
        const regexStr = '^' + val.replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexStr, 'i');
        if (regex.test(path.basename(file)) || regex.test(file)) {
          isIgnored = true;
          break;
        }
      }
    }

    if (!isIgnored) {
      allowedFiles.push(file);
      allowedBytes += fs.statSync(path.join(rootDir, file)).size;
    }
  }

  // 必须包含的
  assert.ok(allowedFiles.includes('game.js'), '发布包必须包含 game.js');
  assert.ok(allowedFiles.includes('game.json'), '发布包必须包含 game.json');
  assert.ok(allowedFiles.some(f => f.startsWith('dist/')), '发布包必须包含 dist/ 构建产物');
  assert.ok(allowedFiles.some(f => f.startsWith('assets/') && f.endsWith('.png')), '发布包必须包含 assets 中的图片');
  assert.ok(allowedFiles.some(f => f.startsWith('assets/audio/') && f.endsWith('.wav')), '发布包必须包含 assets/audio 中的音频文件');

  // 不能包含的
  assert.ok(!allowedFiles.some(f => f.startsWith('node_modules/')), '发布包不能包含 node_modules');
  assert.ok(!allowedFiles.some(f => f.startsWith('src/')), '发布包不能包含 src 源码');
  assert.ok(!allowedFiles.some(f => f.startsWith('test/')), '发布包不能包含 test 测试');
  assert.ok(!allowedFiles.some(f => f.includes('_fail.png')), '发布包不能包含任何报错兜底图 _fail.png');
  assert.ok(!allowedFiles.includes('{'), '发布包不能包含根目录异常文件 {');

  const jsFiles = allowedFiles.filter(f => f.endsWith('.js'));
  const pngFiles = allowedFiles.filter(f => f.endsWith('.png'));
  const wavFiles = allowedFiles.filter(f => f.endsWith('.wav'));
  const otherFiles = allowedFiles.length - jsFiles.length - pngFiles.length - wavFiles.length;

  console.log(`\n=================== 发布包校验清单 ===================`);
  console.log(`发布文件总数: ${allowedFiles.length}`);
  console.log(`发布包总字节数: ${allowedBytes} 字节 (${(allowedBytes / 1024 / 1024).toFixed(3)} MB)`);
  console.log(`JS 代码文件: ${jsFiles.length} 个`);
  console.log(`PNG 美术图片: ${pngFiles.length} 张`);
  console.log(`WAV 核心音效: ${wavFiles.length} 个`);
  console.log(`其它辅助/配置文件: ${otherFiles} 个`);
  console.log(`======================================================\n`);
});
