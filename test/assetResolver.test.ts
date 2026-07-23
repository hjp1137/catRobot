import assert from 'assert';
import { test } from 'node:test';
import { resolveAssetKey } from '../dist/core/AssetResolver.js';

test('AssetResolver Unit Tests', async (t) => {
  await t.test('1. 装备 ID 映射与回退', () => {
    const equips = [
      'rusty_claw', 'neon_blaster', 'starcore_cannon',
      'patched_armor', 'alloy_armor', 'sewer_guard',
      'small_core', 'neon_core', 'starcore_fragment',
      'lava_cannon', 'lava_armor', 'lava_core'
    ];
    for (const eq of equips) {
      assert.strictEqual(resolveAssetKey('equip', eq), `equip_${eq}`);
      assert.strictEqual(resolveAssetKey('equip', `equip_${eq}`), `equip_${eq}`);
    }
    // 回退
    assert.strictEqual(resolveAssetKey('equip', 'invalid_equip'), 'equip_icon');
  });

  await t.test('2. 符文 ID 映射与回退', () => {
    assert.strictEqual(resolveAssetKey('rune', 'fire_guard_rune'), 'rune_fire_guard');
    assert.strictEqual(resolveAssetKey('rune', 'fire_guard'), 'rune_fire_guard');
    assert.strictEqual(resolveAssetKey('rune', 'cannon_rune_1'), 'rune_cannon_rune');
    assert.strictEqual(resolveAssetKey('rune', 'cannon_rune'), 'rune_cannon_rune');
    assert.strictEqual(resolveAssetKey('rune', 'shield_rune_1'), 'rune_shield_rune');
    assert.strictEqual(resolveAssetKey('rune', 'shield_rune'), 'rune_shield_rune');
    assert.strictEqual(resolveAssetKey('rune', 'poison_guard_rune'), 'rune_poison_guard');
    assert.strictEqual(resolveAssetKey('rune', 'poison_guard'), 'rune_poison_guard');
    // 回退
    assert.strictEqual(resolveAssetKey('rune', 'invalid_rune'), 'rune_icon');
  });

  await t.test('3. 敌人变体/ID 映射与回退', () => {
    const mappings: Record<string, string> = {
      normal: 'enemy_rat',
      mouse: 'enemy_rat',
      elite: 'enemy_elite_mouse',
      elite_mouse: 'enemy_elite_mouse',
      boss: 'enemy_rat_king',
      mecha_rat_king: 'enemy_rat_king',
      beetle: 'enemy_beetle',
      mechanical_beetle: 'enemy_beetle',
      toxic: 'enemy_toxic',
      toxic_mecha_bug: 'enemy_toxic',
      elite_toxic: 'enemy_elite_toxic',
      elite_toxic_bug: 'enemy_elite_toxic',
      chapter2_boss: 'enemy_pollution_queen',
      pollution_core_queen: 'enemy_pollution_queen',
      fire_normal: 'enemy_fire_beetle',
      fire_beetle: 'enemy_fire_beetle',
      fire_fast: 'enemy_blaze_hound',
      blaze_hound: 'enemy_blaze_hound',
      fire_elite: 'enemy_magma_golem',
      magma_golem: 'enemy_magma_golem',
      chapter3_boss: 'enemy_furnace_guard',
      furnace_guard: 'enemy_furnace_guard'
    };

    for (const [id, expected] of Object.entries(mappings)) {
      assert.strictEqual(resolveAssetKey('enemy', id), expected, `ID ${id} 映射错误`);
    }
    // 回退
    assert.strictEqual(resolveAssetKey('enemy', 'invalid_enemy'), 'enemy_rat');
  });
});
