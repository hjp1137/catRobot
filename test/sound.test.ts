import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { SoundManager } from '../dist/core/SoundManager.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { pollButtonTap } from '../dist/ui/UIWidgets.js';
import { STAGE_1_1, STAGE_1_5 } from '../dist/data/StageConfig.js';


test('SoundManager：成功播放与 alert 循环', () => {
  const mockAudioContexts: any[] = [];
  const playCounts: Record<string, number> = {};
  const stopCounts: Record<string, number> = {};
  
  (SoundManager as any).instance = null;
  
  (globalThis as any).wx = {
    createInnerAudioContext: () => {
      const ctx = {
        src: '',
        loop: false,
        play: function() {
          playCounts[this.src] = (playCounts[this.src] || 0) + 1;
        },
        stop: function() {
          stopCounts[this.src] = (stopCounts[this.src] || 0) + 1;
        },
        destroy: () => {},
      };
      mockAudioContexts.push(ctx);
      return ctx;
    }
  };

  const sm = SoundManager.getInstance();
  sm.play('click');
  assert.equal(playCounts['assets/audio/click.wav'], 1);
  
  sm.play('alert');
  assert.equal(playCounts['assets/audio/alert.wav'], 1);
  
  const alertCtx = mockAudioContexts.find(c => c.src === 'assets/audio/alert.wav');
  assert.equal(alertCtx.loop, true);

  delete (globalThis as any).wx;
});

test('SoundManager：50ms 内重复触发节流', () => {
  const mockAudioContexts: any[] = [];
  const playCounts: Record<string, number> = {};
  
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => {
      const ctx = {
        src: '',
        loop: false,
        play: function() {
          playCounts[this.src] = (playCounts[this.src] || 0) + 1;
        },
        stop: function() {},
        destroy: () => {},
      };
      mockAudioContexts.push(ctx);
      return ctx;
    }
  };

  const sm = SoundManager.getInstance();
  sm.play('click');
  sm.play('click');
  sm.play('click');
  assert.equal(playCounts['assets/audio/click.wav'], 1, '50ms内重复播放应被节流');

  delete (globalThis as any).wx;
});

test('SoundManager：stopAll 清理长音效', () => {
  const mockAudioContexts: any[] = [];
  const stopCounts: Record<string, number> = {};
  
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => {
      const ctx = {
        src: '',
        loop: false,
        play: function() {},
        stop: function() {
          stopCounts[this.src] = (stopCounts[this.src] || 0) + 1;
        },
        destroy: () => {},
      };
      mockAudioContexts.push(ctx);
      return ctx;
    }
  };

  const sm = SoundManager.getInstance();
  sm.play('alert');
  sm.stopAll();
  
  assert.ok(stopCounts['assets/audio/alert.wav'] > 0);

  delete (globalThis as any).wx;
});

test('SoundManager：安全降级（wx 缺失）', () => {
  delete (globalThis as any).wx;
  (SoundManager as any).instance = null;
  
  const sm = SoundManager.getInstance();
  assert.doesNotThrow(() => {
    sm.play('click');
    sm.stopAll();
    sm.destroy();
  });
});

test('WAV音频文件物理格式与字节数校验', () => {
  const audioDir = path.resolve(process.cwd(), 'assets/audio');
  
  const wavFiles = [
    { name: 'click.wav', size: 1146 },
    { name: 'attack.wav', size: 3350 },
    { name: 'alert.wav', size: 6658 },
    { name: 'victory.wav', size: 11068 },
    { name: 'defeat.wav', size: 17684 }
  ];

  for (const info of wavFiles) {
    const filePath = path.join(audioDir, info.name);
    assert.ok(fs.existsSync(filePath), `文件不存在: ${info.name}`);
    const fileBytes = fs.readFileSync(filePath);
    
    // 校验字节数与清单一致
    assert.equal(fileBytes.length, info.size, `${info.name} 字节数与清单声明不一致`);

    // 校验 RIFF 头部
    assert.equal(fileBytes.toString('ascii', 0, 4), 'RIFF', `${info.name} 非 RIFF 文件`);
    // 校验 WAVE 头部
    assert.equal(fileBytes.toString('ascii', 8, 12), 'WAVE', `${info.name} 非 WAVE 格式`);
    // 校验 fmt 头部
    assert.equal(fileBytes.toString('ascii', 12, 16), 'fmt ', `${info.name} 缺少 fmt chunk`);
    
    // 校验音频格式为 PCM (1)
    const format = fileBytes.readUInt16LE(20);
    assert.equal(format, 1, `${info.name} 非 PCM 编码格式`);
    
    // 校验单声道 (1)
    const channels = fileBytes.readUInt16LE(22);
    assert.equal(channels, 1, `${info.name} 非单声道 (Mono)`);
    
    // 校验采样率 (11025Hz)
    const sampleRate = fileBytes.readUInt32LE(24);
    assert.equal(sampleRate, 11025, `${info.name} 采样率不是 11025Hz`);
    
    // 校验位深 (16-bit)
    const bitsPerSample = fileBytes.readUInt16LE(34);
    assert.equal(bitsPerSample, 16, `${info.name} 位深不是 16-bit`);
  }
});

test('集成断言：pollButtonTap 命中有效按钮播放 click，禁用/未命中不播放', () => {
  const playCounts: Record<string, number> = {};
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => ({
      src: '',
      loop: false,
      play() { playCounts[this.src] = (playCounts[this.src] || 0) + 1; },
      stop() {},
      destroy() {}
    })
  };

  const ctx = new MockContext();
  const btnActive = { id: 'btn_1', label: 'Active', x: 10, y: 10, w: 100, h: 40 };
  const btnDisabled = { id: 'btn_2', label: 'Disabled', x: 10, y: 60, w: 100, h: 40, disabled: true };

  // 1. 未命中点击：tap 坐标在按钮外
  ctx.input.simulateTap(0, 0);
  const result1 = pollButtonTap(ctx as any, [btnActive, btnDisabled]);
  assert.equal(result1, null);
  assert.equal(playCounts['assets/audio/click.wav'], undefined);

  // 2. 命中禁用按钮
  ctx.input.simulateTap(15, 65);
  const result2 = pollButtonTap(ctx as any, [btnActive, btnDisabled]);
  assert.equal(result2, null);
  assert.equal(playCounts['assets/audio/click.wav'], undefined);

  // 3. 命中有效按钮
  ctx.input.simulateTap(15, 15);
  const result3 = pollButtonTap(ctx as any, [btnActive, btnDisabled]);
  assert.equal(result3, btnActive);
  assert.equal(playCounts['assets/audio/click.wav'], 1);

  delete (globalThis as any).wx;
});

test('集成断言：普攻与主动技能成功/失败释放音频证明', () => {
  const playCounts: Record<string, number> = {};
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => ({
      src: '',
      loop: false,
      play() { playCounts[this.src] = (playCounts[this.src] || 0) + 1; },
      stop() {},
      destroy() {}
    })
  };

  const ctx = new MockContext();
  const game = new GameManager(ctx as any);
  const battle = new BattleManager(ctx as any, game);
  game.setBattle(battle);

  // 使用一个包含 1 个普通机械鼠的关卡开始战斗
  const stage = { ...STAGE_1_1, enemies: [{ enemyId: 'mouse', count: 1 }], waves: undefined };
  battle.start(stage);

  // 推进一小段时间，确保敌人已经生成
  ctx.advance(0.016);
  battle.update(0.016);

  // 此时敌人刚生成，在攻击范围外
  const e = battle.enemies[0];
  assert.ok(e);
  
  // 1. 此时更新，没有敌人可以攻击，不能播放 attack.wav
  const attackCountBefore = playCounts['assets/audio/attack.wav'] || 0;
  battle.update(0.6); // 推进 0.6 秒以触发 autoAttack Cooldown
  assert.equal(playCounts['assets/audio/attack.wav'] || 0, attackCountBefore, '超出范围普攻不应播放attack');

  // 2. 将敌人拉到玩家脚下（进入攻击范围）
  e.x = battle.player.x + 10;
  e.y = battle.player.y;
  
  // 3. 推进一帧，攻击击中，应播放 1 次 attack.wav
  battle.update(0.6);
  assert.equal(playCounts['assets/audio/attack.wav'], attackCountBefore + 1, '击中敌人应播放attack');

  // 4. 技能释放测试：
  // 关键：因为单测执行瞬发，Date.now() 无变化。手动清理 SoundManager 的节流缓存，防止被节流
  (SoundManager.getInstance() as any).lastPlayTimes.clear();

  // 重置 attack.wav 的计数
  const attackCountBeforeSkill = playCounts['assets/audio/attack.wav'] || 0;

  // 主动释放技能 meow_cannon
  const res1 = battle.usePlayerSkill('meow_cannon');
  assert.equal(res1.ok, true, '技能成功释放');
  assert.equal(playCounts['assets/audio/attack.wav'], attackCountBeforeSkill + 1, '技能成功释放播放attack');

  // 紧接着再次释放（应因为CD而失败）
  const attackCountAfterSuccess = playCounts['assets/audio/attack.wav'] || 0;
  const res2 = battle.usePlayerSkill('meow_cannon');
  assert.equal(res2.ok, false, 'CD中释放失败');
  assert.equal(playCounts['assets/audio/attack.wav'], attackCountAfterSuccess, '技能失败释放不应播放attack');

  delete (globalThis as any).wx;
});

test('集成断言：Boss关Boss波次生成播放 alert，普通波/普通关不播放', () => {
  const playCounts: Record<string, number> = {};
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => ({
      src: '',
      loop: false,
      play() { playCounts[this.src] = (playCounts[this.src] || 0) + 1; },
      stop() {},
      destroy() {}
    })
  };

  const ctx = new MockContext();
  const game = new GameManager(ctx as any);
  const battle = new BattleManager(ctx as any, game);
  game.setBattle(battle);

  // 1. 普通关卡 1-1（无Boss波）
  battle.start(STAGE_1_1);
  ctx.advance(0.016);
  battle.update(0.016);
  assert.equal(playCounts['assets/audio/alert.wav'] || 0, 0, '普通波不应播放alert');

  // 2. Boss 关卡 1-5
  // 重置 instance 和 记录
  (SoundManager as any).instance = null;
  const playCountsBoss: Record<string, number> = {};
  (globalThis as any).wx.createInnerAudioContext = () => ({
    src: '',
    loop: false,
    play() { playCountsBoss[this.src] = (playCountsBoss[this.src] || 0) + 1; },
    stop() {},
    destroy() {}
  });

  const battleBoss = new BattleManager(ctx as any, game);
  game.setBattle(battleBoss);
  battleBoss.start(STAGE_1_5);
  
  // 第一波是普通波（非Boss波）
  ctx.advance(0.016);
  battleBoss.update(0.016);
  assert.equal(playCountsBoss['assets/audio/alert.wav'] || 0, 0, '1-5 第一波普通波不播放alert');

  // 杀光第 1 波，触发 nextSpawnDelay，并推进 2.0s 生成第 2 波
  battleBoss.enemies = [];
  battleBoss.update(0.016);
  ctx.advance(2.0);
  battleBoss.update(2.0);
  battleBoss.update(0.016); // 真正 spawn 第 2 波敌人

  // 杀光第 2 波，触发 nextSpawnDelay，并推进 2.0s 生成第 3 波 (Boss 鼠王波)
  battleBoss.enemies = [];
  battleBoss.update(0.016);
  ctx.advance(2.0);
  battleBoss.update(2.0);
  battleBoss.update(0.016); // 真正 spawn 第 3 波 (Boss) 敌人
  
  // 此时第 3 波生成，应该有 Boss 且播放 alert 警报音效
  assert.ok(battleBoss.enemies.some(e => e.isBoss));
  assert.equal(playCountsBoss['assets/audio/alert.wav'], 1, '1-5 Boss波生成时应播放alert');

  delete (globalThis as any).wx;
});

test('集成断言：胜利播放 victory，失败播放 defeat，且结算前停止循环 alert', () => {
  const playCounts: Record<string, number> = {};
  const stopCounts: Record<string, number> = {};
  
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => ({
      src: '',
      loop: false,
      play() {
        playCounts[this.src] = (playCounts[this.src] || 0) + 1;
      },
      stop() {
        stopCounts[this.src] = (stopCounts[this.src] || 0) + 1;
      },
      destroy() {}
    })
  };

  // 1. 胜利测试
  const ctx = new MockContext();
  const game = new GameManager(ctx as any);
  const battle = new BattleManager(ctx as any, game);
  game.setBattle(battle);

  // 模拟 Boss 关 1-5 开始
  battle.start(STAGE_1_5);
  ctx.advance(0.016);
  battle.update(0.016);
  
  // 杀光第 1 波，触发 nextSpawnDelay，推进 2.0s 生成第 2 波
  battle.enemies = [];
  battle.update(0.016);
  ctx.advance(2.0);
  battle.update(2.0);
  battle.update(0.016); // 真正 spawn 第 2 波敌人

  // 杀光第 2 波，触发 nextSpawnDelay，推进 2.0s 生成第 3 波 (Boss 鼠王波)
  battle.enemies = [];
  battle.update(0.016);
  ctx.advance(2.0);
  battle.update(2.0);
  battle.update(0.016); // 真正 spawn 第 3 波 (Boss) 敌人
  
  // 此时第 3 波生成，触发 Boss 波，alert 播放起来
  assert.equal(playCounts['assets/audio/alert.wav'], 1);

  // 把所有敌人杀光以触发胜利结算
  battle.enemies = [];
  (battle.waveManager as any).finished = true; // 强行让 waveManager 识别为最后一波已清空
  
  const alertStopCountBeforeWin = stopCounts['assets/audio/alert.wav'] || 0;
  battle.update(0.1);
  
  // 应播放 victory，不播放 defeat
  assert.equal(playCounts['assets/audio/victory.wav'], 1);
  assert.equal(playCounts['assets/audio/defeat.wav'] || 0, 0);
  // 在播放 victory 之前必须停止 alert
  assert.ok((stopCounts['assets/audio/alert.wav'] || 0) > alertStopCountBeforeWin, '结算胜利时应停止 alert');

  // 2. 失败测试
  // 重置
  (SoundManager as any).instance = null;
  const playCountsDefeat: Record<string, number> = {};
  const stopCountsDefeat: Record<string, number> = {};
  (globalThis as any).wx.createInnerAudioContext = () => ({
    src: '',
    loop: false,
    play() {
      playCountsDefeat[this.src] = (playCountsDefeat[this.src] || 0) + 1;
    },
    stop() {
      stopCountsDefeat[this.src] = (stopCountsDefeat[this.src] || 0) + 1;
    },
    destroy() {}
  });

  const battle2 = new BattleManager(ctx as any, game);
  game.setBattle(battle2);
  battle2.start(STAGE_1_5);
  ctx.advance(0.016);
  battle2.update(0.016);
  
  // 杀光第 1 波，触发 nextSpawnDelay，推进 2.0s 进入第 2 波
  battle2.enemies = [];
  battle2.update(0.016);
  ctx.advance(2.0);
  battle2.update(2.0);
  battle2.update(0.016); // 真正 spawn 第 2 波敌人

  // 杀光第 2 波，触发 nextSpawnDelay，推进 2.0s 进入第 3 波 (Boss 鼠王波)
  battle2.enemies = [];
  battle2.update(0.016);
  ctx.advance(2.0);
  battle2.update(2.0);
  battle2.update(0.016); // 真正 spawn 第 3 波 (Boss) 敌人
  
  // 此时第 3 波生成，触发 Boss 波，alert 播放起来
  assert.equal(playCountsDefeat['assets/audio/alert.wav'], 1);

  // 玩家血量扣为 0 触发战败
  battle2.player.takeDamage(999999);
  const alertStopCountBeforeDefeat = stopCountsDefeat['assets/audio/alert.wav'] || 0;
  battle2.update(0.1);

  // 应播放 defeat，不播放 victory
  assert.equal(playCountsDefeat['assets/audio/defeat.wav'], 1);
  assert.equal(playCountsDefeat['assets/audio/victory.wav'] || 0, 0);
  assert.ok((stopCountsDefeat['assets/audio/alert.wav'] || 0) > alertStopCountBeforeDefeat, '结算失败时应停止 alert');

  delete (globalThis as any).wx;
});

test('集成断言：重试或下一局战斗开始时清除旧音频残留', () => {
  const stopCounts: Record<string, number> = {};
  
  (SoundManager as any).instance = null;
  (globalThis as any).wx = {
    createInnerAudioContext: () => ({
      src: '',
      loop: false,
      play() {},
      stop() {
        stopCounts[this.src] = (stopCounts[this.src] || 0) + 1;
      },
      destroy() {}
    })
  };

  const ctx = new MockContext();
  const game = new GameManager(ctx as any);
  const battle = new BattleManager(ctx as any, game);
  game.setBattle(battle);

  // 模拟开始战斗
  battle.start(STAGE_1_1);
  
  // 假设在局内某些音频在播放，此时重试，即重新 start
  const alertStopCountBeforeRetry = stopCounts['assets/audio/alert.wav'] || 0;
  const clickStopCountBeforeRetry = stopCounts['assets/audio/click.wav'] || 0;
  
  battle.start(STAGE_1_1);
  
  // 应该调用 stopAll 停止 click, alert 等音频
  assert.ok((stopCounts['assets/audio/alert.wav'] || 0) > alertStopCountBeforeRetry, '重新 start 时应停止上一局的 alert');
  assert.ok((stopCounts['assets/audio/click.wav'] || 0) > clickStopCountBeforeRetry, '重新 start 时应停止上一局的 click');

  delete (globalThis as any).wx;
});



