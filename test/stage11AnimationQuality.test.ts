import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name: string) => JSON.parse(fs.readFileSync(`content-store/published/${name}`, 'utf8'));

test('任务35：第一关主角与全部敌人使用后台多帧移动动画', () => {
  const content = read('content.snapshot.json');
  const stageSnapshot = read('stage-orchestration.snapshot.json');
  const art = read('art-manifest.snapshot.json');
  const stage = stageSnapshot.stages.find((item: any) => item.stageId === 'stage_battle_1_1');
  const enemyIds = [...new Set(stage.waves.flatMap((wave: any) =>
    wave.entries.map((entry: any) => entry.enemyTemplateId)))] as string[];

  assert.deepEqual(enemyIds.sort(), ['enemy_scrap_guard_elite_01', 'enemy_scrap_mouse_01']);
  const hero = content.heroVisuals.find((item: any) => item.id === 'hero_mecha_cat_default');
  assertClip(content, art, hero.visual.animationClipKeys.move, 8, '第一关主角');

  for (const enemyId of enemyIds) {
    const enemy = content.enemies.find((item: any) => item.id === enemyId);
    assert.ok(enemy?.visual.animationClipKeys?.move, `${enemyId} 必须绑定移动 Clip`);
    assertClip(content, art, enemy.visual.animationClipKeys.move, 6, enemyId);
  }
});

function assertClip(content: any, art: any, clipKey: string, minimumFrames: number, label: string): void {
  const clip = content.animationClips.find((item: any) => item.key === clipKey);
  assert.ok(clip, `${label} 的移动 Clip 必须进入正式快照`);
  assert.ok(clip.frames.length >= minimumFrames, `${label} 至少需要 ${minimumFrames} 帧`);
  assert.equal(new Set(clip.frames.map((frame: any) => frame.artKey)).size, clip.frames.length,
    `${label} 每帧必须使用独立 Art Key`);
  for (const frame of clip.frames) {
    const resource = art.resources[frame.artKey];
    assert.ok(resource, `${label} 缺少正式资源 ${frame.artKey}`);
    assert.equal(resource.hasAlpha, true, `${frame.artKey} 必须是透明 PNG`);
    assert.ok(fs.existsSync(resource.path), `${frame.artKey} 正式文件不存在`);
  }
}
