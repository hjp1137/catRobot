import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import { getBattleTestState } from '../dist/debug/BattleTestProbe.js';
import { MainUI } from '../dist/ui/MainUI.js';

test('任务12.2：战斗测试探针暴露 GUI 自动化验收状态', () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start({ ...STAGE_1_1, contentStageId: undefined, enemies: [{ enemyId: 'mouse', count: 2 }], waves: undefined });
  game.scene = 'battle';
  battle.update(0.016);
  battle.player.attack = 999;
  const enemy = battle.enemies[0];
  enemy.x = battle.player.x + 40;
  enemy.y = battle.player.y;
  battle.enemies[1].x = battle.player.x + 320;
  battle.enemies[1].y = battle.player.y;
  ctx.advance(0.7);
  battle.update(0.7);
  ctx.advance(0.1);
  battle.update(0.1);
  battle.usePlayerSkill('heavy_shield');

  const state = getBattleTestState(game, battle, ctx);
  assert.equal(state.scene, 'battle');
  assert.equal(state.playerVisible, true);
  assert.ok(state.enemyTotal >= 1);
  assert.ok(state.bullets >= 1);
  assert.ok(state.damageNumbers >= 1);
  assert.ok(state.explosions >= 1);
  assert.equal(state.skillCooldown, true);
  assert.ok(state.hudSafeTop > 0);
  assert.equal(state.hasBlockingError, false);
});

test('任务12.2：提供一键微信 GUI 自动化命令与脚本', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.scripts['test:gui:wechat'], 'node scripts/test-gui-wechat.cjs');
  assert.equal(fs.existsSync('scripts/test-gui-wechat.cjs'), true);
});

test('任务12.2：GUI 脚本声明 9 个真实截图验收点', () => {
  const script = fs.readFileSync('scripts/test-gui-wechat.cjs', 'utf8');
  const required = [
    '01_home.png',
    '02_guide_enemy.png',
    '03_kill_done.png',
    '04_resource_arrow.png',
    '05_resource_collect.png',
    '06_chest_guide.png',
    '07_completion.png',
  ];
  for (const file of required) {
    assert.ok(script.includes(file), `缺少截图点 ${file}`);
  }
});

test('任务12.2：devtools 首页提供快速进入 1-1 战斗入口', () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  (ctx as any).getSystemInfo = () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 2, platform: 'devtools' });
  const ui = new MainUI(ctx, game);
  const btn = (ui as any).guiBattleButton;
  assert.ok(btn, 'devtools 下应显示战斗测试入口');
  ctx.input.tapX = btn.x + btn.w / 2;
  ctx.input.tapY = btn.y + btn.h / 2;
  ui.handleClick();
  assert.equal(game.scene, 'battle');
  assert.equal(battle.totalEnemies, 12);
  assert.equal(battle.waveManager.totalWaves, 3);
});
