const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const slots = { helmet: '头盔', chest: '上衣', legs: '裤子', boots: '鞋子', armor: '护甲', ring: '戒指', left_weapon: '左手武器', right_weapon: '右手武器' };
const tiers = [
  { id: 'blackiron', name: '黑铁', color: '#869eae', scale: 1, rarity: 'common' },
  { id: 'bronze', name: '青铜', color: '#cd9b66', scale: 1.3, rarity: 'common' },
  { id: 'silver', name: '白银', color: '#c4dcea', scale: 1.6, rarity: 'rare' },
  { id: 'gold', name: '黄金', color: '#f5cd64', scale: 1.9, rarity: 'rare' },
  { id: 'astral', name: '星辰', color: '#aa9fff', scale: 2.2, rarity: 'epic' },
];
const families = ['assault', 'bastion', 'strider', 'artillery', 'ward'];
const familyNames = ['强攻', '守御', '机动', '炮击', '护盾'];
const names = [
  ['赤火', '磐石', '清风', '流火', '明月'],
  ['烈焰', '山岳', '疾风', '雷鸣', '流云'],
  ['霜刃', '玄冰', '飞雪', '惊雷', '月华'],
  ['玄凤', '麒麟', '青鸟', '毕方', '白泽'],
  ['白虎', '玄武', '鲲鹏', '朱雀', '青龙'],
];
const effects = {
  assault: [{ attackDamageBonus: .04 }, { attackSpeedBonus: .03 }, { skillDamageBonus: .05 }, { attackDamageBonus: .06 }],
  bastion: [{ hp: 16 }, { defense: 1 }, { damageReduction: .02 }, { hp: 24, defense: .5 }],
  strider: [{ moveSpeedBonus: .04 }, { attackSpeedBonus: .025 }, { cooldownReduction: .025 }, { moveSpeedBonus: .035, attackDamageBonus: .03 }],
  artillery: [{ skillDamageBonus: .06 }, { cooldownReduction: .025 }, { attackDamageBonus: .025 }, { skillDamageBonus: .10 }],
  ward: [{ shieldDurationBonus: .25 }, { cooldownReduction: .025 }, { shieldReductionBonus: .015 }, { shieldDurationBonus: .35, damageReduction: .015 }],
};
const statNames = { attackDamageBonus: '普攻伤害', attackSpeedBonus: '射速', skillDamageBonus: '炮击伤害', hp: '装甲生命', defense: '防御', damageReduction: '伤害减免', moveSpeedBonus: '移动速度', cooldownReduction: '技能冷却缩减', shieldDurationBonus: '护盾时长', shieldReductionBonus: '护盾减伤' };
const scaled = (stats, k) => Object.fromEntries(Object.entries(stats).map(([key, n]) => [key, Math.round(n * k * 10000) / 10000]));
const label = stats => Object.entries(stats).map(([key, n]) => `${statNames[key]} +${key === 'hp' || key === 'defense' ? n : key === 'shieldDurationBonus' ? `${n}秒` : `${Math.round(n * 10000) / 100}%`}`).join('，');
const equipment = {};
const sets = {};
const armorSlots = Object.keys(slots).slice(0, 6);
const legacyConfigIds = {};
const legacyParts = { left_armor: 'armor', right_armor: 'armor', left_ring: 'ring', right_ring: 'ring', necklace: 'ring' };
const bases = { helmet: { hp: 3, defense: .1 }, chest: { hp: 6, defense: .2 }, legs: { hp: 4 }, boots: { hp: 2, moveSpeedBonus: .005 }, armor: { hp: 6, defense: .2 }, ring: { attack: .8, skillDamageBonus: .005 } };
for (const [tierIndex, tier] of tiers.entries()) {
  for (const [artCol, family] of families.entries()) {
    const id = `${tier.id}_${family}`;
    const combinedFinal = { ...effects[family][2] };
    for (const [key, value] of Object.entries(effects[family][3])) combinedFinal[key] = (combinedFinal[key] || 0) + value;
    const bonuses = [effects[family][0], effects[family][1], combinedFinal].map((stats, i) => {
      const values = scaled(stats, tier.scale);
      return { pieces: [2, 4, 6][i], label: label(values), stats: values };
    });
    sets[id] = { id, name: names[tierIndex][artCol], tier: tier.id, family, family_name: familyNames[artCol], color: tier.color, art_col: artCol, atlas_path: `res://assets/equipment/${tier.id}.png`, bonuses };
    for (const slot of armorSlots) {
      const configId = `${id}_${slot}`;
      equipment[configId] = { id: configId, name: `${sets[id].name}·${slots[slot]}`, slot, rarity: tier.rarity, tier: tier.id, setId: id, family, description: `${tier.name}${familyNames[artCol]}套装配件；同名套装2/4/6件激活效果。`, baseStats: scaled(bases[slot], tier.scale), power: Math.round(8 * tier.scale), art_col: artCol, atlas_path: sets[id].atlas_path, icon_path: sets[id].atlas_path };
    }
    for (const [oldPart, newPart] of Object.entries(legacyParts)) legacyConfigIds[`${id}_${oldPart}`] = `${id}_${newPart}`;
  }
}
const weaponKinds = [
  ['cannon', '均衡机炮', .60, 1, 1, 360], ['repeater', '速射线圈', .38, .60, 1, 330],
  ['rail', '磁轨重炮', .90, 1.65, 1, 460], ['scatter', '三联散射炮', .80, .42, 3, 285],
  ['pulse', '脉冲发射器', .48, .82, 1, 390],
];
for (const tier of tiers) {
  for (const [artCol, [kind, name, interval, damageFactor, projectiles, range]] of weaponKinds.entries()) {
    const id = `${tier.id}_weapon_${kind}`;
    equipment[id] = { id, name: `${tier.name}·${name}`, slot: 'weapon', rarity: tier.rarity, tier: tier.id, description: '可装配左右手；武器不计入机甲套装件数。', baseStats: { attack: Math.round(1.8 * tier.scale * 100) / 100 }, power: Math.round(12 * tier.scale), weapon: { kind, interval, damage_factor: damageFactor, projectiles, range }, color: tier.color, art_col: artCol, atlas_path: `res://assets/equipment/${tier.id}.png`, icon_path: `res://assets/equipment/${tier.id}.png` };
  }
}
const drop_profiles = {};
const weights = [[100, 0, 0, 0, 0], [60, 40, 0, 0, 0], [15, 55, 30, 0, 0], [0, 20, 65, 15, 0], [0, 5, 45, 45, 5]];
for (let stage = 1; stage <= 10; stage++) {
  const rank = Math.floor((stage - 1) / 2);
  const stageId = stage === 1 ? 'stage_battle_1_1' : `stage_ch1_${String(stage).padStart(2, '0')}`;
  drop_profiles[stageId] = { difficulty: `D${rank + 1}`, armor_probability: [.16, .19, .22, .25, .28][rank], weapon_probability: [.08, .09, .10, .11, .12][rank], tier_weights: weights[rank], pity_after: 8 };
}
const output = { schema_version: 3, slots, tiers, sets, equipment, drop_profiles, armor_slots: armorSlots, families, weapon_kinds: weaponKinds.map(row => row[0]), legacy_config_ids: legacyConfigIds };
fs.writeFileSync(path.join(root, 'godot', 'data', 'equipment_v2.json'), JSON.stringify(output) + '\n');
console.log(`Equipment v2 generated: ${Object.keys(sets).length} sets, ${Object.keys(equipment).length} items, ${Object.keys(slots).length} slots.`);
