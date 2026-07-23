import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { ART_MANIFEST, ART_PACKS } from '../dist/assets/ArtManifest.js';
import { ART_MANIFEST_SNAPSHOT } from '../dist/assets/generated/artManifestSnapshot.js';
import { getArtResource, getArtPath, getArtFallback } from '../dist/assets/ArtResourceResolver.js';
import { IMAGE_RESOURCES } from '../dist/core/ResourceManager.js';
import type { ArtResourceKey } from '../src/assets/ArtResourceKeys.ts';

function readPngMeta(filePath: string) {
  const buf = fs.readFileSync(filePath);
  return {
    bytes: buf.length,
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colorType: buf[25],
  };
}

test('任务17：Manifest 结构与 Key 唯一性校验', () => {
  const keys = Object.keys(ART_MANIFEST);
  assert.ok(keys.length > 0);
  assert.ok(keys.includes('player.mecha.normal'));
  assert.ok(keys.includes('enemy.rat.normal'));
  assert.ok(keys.includes('ui.skill.shield'));

  // 唯一性检验：在 JS 中 Object.keys 本身无重复
  const keySet = new Set(keys);
  assert.equal(keySet.size, keys.length);
});

test('任务17：Art Resource Resolver 解析及 fallback 回退测试', () => {
  const pathNormal = getArtPath('enemy.fireBeetle');
  assert.equal(pathNormal, 'assets/enemy_fire_beetle.png');

  // fallback 资源链条合法性
  const entry = getArtResource('enemy.fireBeetle');
  assert.equal(entry.fallback, 'placeholder.image');

  const pathFallback = getArtFallback('enemy.fireBeetle');
  assert.equal(pathFallback, 'assets/stone.png'); // placeholder.image 指向 assets/stone.png
});

test('任务17：资源包配置及默认启用检验', () => {
  assert.ok(ART_PACKS.base.enabled);
  assert.ok(ART_PACKS.prototype.enabled);
  // 任务20中，资源包已正式设置为启用以改变小游戏视觉表现
  assert.equal(ART_PACKS.training_ground_v1.enabled, true);
});

test('任务17：ResourceManager 动态装配映射路径一致性校验', () => {
  // 任务24后，Resolver 优先读取已发布 Art Manifest Snapshot
  assert.equal(IMAGE_RESOURCES.player_mecha, ART_MANIFEST_SNAPSHOT.resources['player.mechaCat.idle'].path);
  assert.equal(IMAGE_RESOURCES.enemy_rat, ART_MANIFEST_SNAPSHOT.resources['enemy.scrapMouse.normal'].path);
  assert.equal(IMAGE_RESOURCES.skill_cannon, ART_MANIFEST_SNAPSHOT.resources['ui.skill.cannon'].path);
  assert.equal(IMAGE_RESOURCES.status_poison, 'assets/status_poison.png'); // base未覆盖项保持原样
});

test('任务18：新预留正式资源 Key 类型与 virtual 降级属性检验', () => {
  const keys = Object.keys(ART_MANIFEST);
  assert.ok(keys.includes('player.mechaCat.idle'));
  assert.ok(keys.includes('enemy.scrapMouse.normal'));
  assert.ok(keys.includes('enemy.scrapMouse.move'));
  assert.ok(keys.includes('enemy.scrapMouse.attack'));
  assert.ok(keys.includes('enemy.scrapMouse.hurt'));
  assert.ok(keys.includes('enemy.scrapMouse.dead'));
  assert.ok(keys.includes('map.trainingGround.floor'));
  assert.ok(keys.includes('resource.energyCrystal'));
  assert.ok(keys.includes('chest.training.supply'));

  // 已落地物理资源应没有 virtual 标识
  const mechaEntry = ART_MANIFEST['player.mechaCat.idle'];
  assert.ok(!mechaEntry.virtual);
  assert.equal(mechaEntry.pack, 'training_ground_v1');

  // 未落地的 P1/P2 资源继续保持 virtual 虚资源
  const crystalEntry = getArtResource('resource.energyCrystal');
  assert.ok(crystalEntry.virtual);
  assert.equal(crystalEntry.pack, 'training_ground_v1');
});

test('任务19：训练场正式资源包物理目录及 P0 物理槽位对齐校验', () => {
  const baseDir = path.join(process.cwd(), 'assets', 'art-packs', 'training_ground_v1');
  assert.ok(fs.existsSync(baseDir), '正式资源包物理根目录应存在');
  assert.ok(fs.existsSync(path.join(baseDir, 'README.md')), 'README 槽位说明应存在');
  assert.ok(fs.existsSync(path.join(baseDir, 'players')), 'players 子目录应存在');
  assert.ok(fs.existsSync(path.join(baseDir, 'enemies')), 'enemies 子目录应存在');
  assert.ok(fs.existsSync(path.join(baseDir, 'maps')), 'maps 子目录应存在');

  // 验证 P0 样例 Key 对齐到物理子目录且真实存在于磁盘上
  const mechaEntry = ART_MANIFEST['player.mechaCat.idle'];
  assert.equal(mechaEntry.path, 'assets/art-packs/training_ground_v1/players/player_mecha_cat_idle_01.png');
  assert.ok(fs.existsSync(path.join(process.cwd(), mechaEntry.path)), '测试样例物理图片必须真实存在');
});

test('任务20：资源包重定向覆盖及降级解析断言校验', () => {
  // 1. 验证已物理化槽位可以解析出真实的训练场包路径
  const playerPath = getArtPath('player.mecha.normal');
  assert.equal(playerPath, ART_MANIFEST_SNAPSHOT.resources['player.mechaCat.idle'].path);

  const ratPath = getArtPath('enemy.rat.normal');
  assert.equal(ratPath, ART_MANIFEST_SNAPSHOT.resources['enemy.scrapMouse.normal'].path);

  const bgPath = getArtPath('main.bg');
  assert.equal(bgPath, ART_MANIFEST_SNAPSHOT.resources['map.trainingGround.floor'].path);

  // 2. 验证未物理化且标记为 virtual 的 Key 能够正常寻路 fallback 到 prototype 包
  const crystalPath = getArtPath('resource.energyCrystal');
  assert.equal(crystalPath, 'assets/stone.png', 'virtual未放图的资源应安全fallback到stone占位图');
});

test('任务20：P0 physical 图片具备尺寸元数据并不是空白槽位', () => {
  const p0: Array<[string, number, number, boolean]> = [
    ['player.mechaCat.idle', 128, 128, true],
    ['player.mechaCat.move', 128, 128, true],
    ['player.mechaCat.attack', 128, 128, true],
    ['enemy.scrapMouse.normal', 64, 64, true],
    ['enemy.scrapBug.normal', 64, 64, true],
    ['enemy.droneEye.normal', 64, 64, true],
    ['enemy.scrapGuard.elite', 64, 64, true],
    ['map.trainingGround.floor', 800, 1200, false],
    ['map.trainingGround.line', 64, 64, true],
    ['map.trainingGround.boundary', 64, 64, true],
    ['map.trainingGround.zoneMark', 64, 64, true],
  ];
  for (const [key, width, height, transparent] of p0) {
    const entry = getArtResource(key as ArtResourceKey);
    assert.equal(entry.virtual, undefined, `${key} 不应继续是 virtual`);
    assert.equal(entry.width, width, `${key} Manifest width 应准确`);
    assert.equal(entry.height, height, `${key} Manifest height 应准确`);
    assert.equal(entry.transparent, transparent, `${key} transparent 字段应准确`);
    const meta = readPngMeta(path.join(process.cwd(), entry.path));
    assert.equal(meta.width, width, `${key} PNG width 应准确`);
    assert.equal(meta.height, height, `${key} PNG height 应准确`);
    assert.equal(meta.colorType, transparent ? 6 : 2, `${key} PNG 色彩类型应与透明通道声明一致`);
    assert.ok(meta.bytes >= 1024, `${key} 文件体积过小，可能只是不可见占位`);
  }
});
