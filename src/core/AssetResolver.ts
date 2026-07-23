export function resolveAssetKey(type: 'equip' | 'rune' | 'enemy', id: string): string {
  if (type === 'equip') {
    const clean = id.replace(/^equip_/, '');
    const valid = [
      'rusty_claw', 'neon_blaster', 'starcore_cannon',
      'patched_armor', 'alloy_armor', 'sewer_guard',
      'small_core', 'neon_core', 'starcore_fragment',
      'lava_cannon', 'lava_armor', 'lava_core'
    ];
    return valid.includes(clean) ? `equip_${clean}` : 'equip_icon';
  }
  if (type === 'rune') {
    const clean = id.replace(/^rune_/, '');
    if (clean === 'fire_guard_rune' || clean === 'fire_guard') {
      return 'rune_fire_guard';
    }
    if (clean === 'cannon_rune_1' || clean === 'cannon_rune') {
      return 'rune_cannon_rune';
    }
    if (clean === 'shield_rune_1' || clean === 'shield_rune') {
      return 'rune_shield_rune';
    }
    if (clean === 'poison_guard_rune' || clean === 'poison_guard') {
      return 'rune_poison_guard';
    }
    return 'rune_icon';
  }
  if (type === 'enemy') {
    switch (id) {
      case 'normal':
      case 'mouse':
        return 'enemy_rat';
      case 'elite':
      case 'elite_mouse':
        return 'enemy_elite_mouse';
      case 'boss':
      case 'mecha_rat_king':
        return 'enemy_rat_king';
      case 'beetle':
      case 'mechanical_beetle':
        return 'enemy_beetle';
      case 'toxic':
      case 'toxic_mecha_bug':
        return 'enemy_toxic';
      case 'elite_toxic':
      case 'elite_toxic_bug':
        return 'enemy_elite_toxic';
      case 'chapter2_boss':
      case 'pollution_core_queen':
        return 'enemy_pollution_queen';
      case 'fire_normal':
      case 'fire_beetle':
        return 'enemy_fire_beetle';
      case 'fire_fast':
      case 'blaze_hound':
        return 'enemy_blaze_hound';
      case 'fire_elite':
      case 'magma_golem':
        return 'enemy_magma_golem';
      case 'chapter3_boss':
      case 'furnace_guard':
        return 'enemy_furnace_guard';
      default:
        return 'enemy_rat';
    }
  }
  return '';
}
