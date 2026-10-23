import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name: string) => JSON.parse(fs.readFileSync(`content-store/published/${name}`, 'utf8'));

test('任务33：正式快照发布第一章十节与第十节 Boss', () => {
  const content = read('content.snapshot.json');
  const campaign = read('campaign.snapshot.json');
  const chapter = campaign.campaigns.find((item: any) => item.id === 'campaign_main_01')
    ?.chapters.find((item: any) => item.id === 'chapter_scrap_border_01');
  assert.ok(chapter);
  assert.equal(chapter.nodes.length, 10);
  assert.equal(chapter.connections.length, 9);
  assert.deepEqual(chapter.nodes.map((node: any) => node.order), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(chapter.nodes[9].type, 'boss');
  assert.equal(chapter.nodes[9].isEnd, true);
  assert.equal(content.enemies.find((enemy: any) => enemy.id === 'enemy_scrap_mouse_king_01')?.category, 'boss');
  const ids = new Set(chapter.nodes.map((node: any) => node.stageId));
  assert.equal(content.stages.filter((stage: any) => ids.has(stage.id)).length, 10);
});

test('任务33：十节正式编排均由后台配置战术 HUD', () => {
  const campaign = read('campaign.snapshot.json');
  const orchestration = read('stage-orchestration.snapshot.json');
  const chapter = campaign.campaigns[0].chapters[0];
  const configs = chapter.nodes.map((node: any) => orchestration.stages.find((stage: any) => stage.stageId === node.stageId));
  assert.ok(configs.every(Boolean));
  assert.ok(configs.every((stage: any) => stage.layout.exploreHud.layout === 'tactical'));
  assert.ok(configs.every((stage: any) => stage.layout.exploreHud.skillButtonShape === 'hex'));
  assert.ok(configs.every((stage: any) => stage.layout.exploreHud.showSkillLabels === true));
  assert.equal(configs[9].waves.at(-1).entries[0].enemyTemplateId, 'enemy_scrap_mouse_king_01');
});

test('任务33：技能图标由 Hero Art Key 与正式美术版本提供', () => {
  const content = read('content.snapshot.json');
  const art = read('art-manifest.snapshot.json');
  const hero = content.heroVisuals.find((item: any) => item.id === 'hero_mecha_cat_default');
  assert.equal(hero.skills.cannonIconArtKey, 'ui.skill.cannon');
  assert.equal(hero.skills.shieldIconArtKey, 'ui.skill.shield');
  for (const key of ['ui.skill.cannon', 'ui.skill.shield']) {
    const resource = art.resources[key];
    assert.ok(resource.path.startsWith(`assets/art-releases/${art.releaseVersion}/ui/`));
    assert.equal(resource.hasAlpha, true);
    assert.ok(resource.versionNo >= 2);
    assert.match(resource.checksum, /^[a-f0-9]{64}$/);
  }
});

test('任务34：第一章十节正式快照均真实使用俯视地图与碰撞层', () => {
  const campaign = read('campaign.snapshot.json');
  const orchestration = read('stage-orchestration.snapshot.json');
  const chapter = campaign.campaigns[0].chapters[0];
  for (const node of chapter.nodes) {
    const stage = orchestration.stages.find((item: any) => item.stageId === node.stageId);
    const visible = stage.layers.filter((layer: any) => layer.enabled && layer.type !== 'collision');
    const collisions = stage.layers.filter((layer: any) => layer.enabled && layer.type === 'collision');
    assert.equal(visible.length, 1, `${node.name}只能有一个可见地图层`);
    assert.equal(visible[0].artKey, 'map.trainingGround.overhead', `${node.name}必须使用俯视地图`);
    assert.equal(visible[0].width, 1800);
    assert.equal(visible[0].height, 2800);
    assert.equal(collisions.length, 4, `${node.name}必须配置四个地图碰撞区`);
  }
});
