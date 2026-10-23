const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'godot');
const names = {
  content: 'content', campaign: 'campaign', orchestration: 'stage-orchestration',
  progression: 'stage-progression', art: 'art-manifest',
  animation: 'animation-manifest', tutorial: 'tutorial',
};
const data = {};
for (const [key, name] of Object.entries(names)) {
  const source = path.join(root, 'content-store', 'published', `${name}.snapshot.json`);
  data[key] = JSON.parse(fs.readFileSync(source, 'utf8'));
}
const release = data.content.releaseVersion;
for (const [key, snapshot] of Object.entries(data)) {
  if (snapshot.releaseId !== data.content.releaseId) {
    throw new Error(`${key}: published release differs from ${release}`);
  }
}
let copied = 0;
for (const [key, resource] of Object.entries(data.art.resources)) {
  if (!resource.path) continue;
  const source = path.resolve(root, resource.path);
  const relative = path.relative(path.join(root, 'assets', 'art-releases', release), source);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${key}: art path is outside the published release`);
  }
  const output = path.join(target, 'assets', 'imported', relative);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(source, output);
  resource.sourcePath = resource.path;
  resource.path = `res://assets/imported/${relative.split(path.sep).join('/')}`;
  copied++;
}
for (const clip of data.animation.clips) {
  for (const frame of clip.frames) {
    if (!data.art.resources[frame.artKey]?.path) {
      throw new Error(`${clip.key}: missing physical frame ${frame.artKey}`);
    }
  }
}
const stageIds = new Set(data.content.stages.map(stage => stage.id));
for (const campaign of data.campaign.campaigns.filter(item => item.enabled)) {
  for (const chapter of campaign.chapters.filter(item => item.enabled)) {
    for (const node of chapter.nodes.filter(item => item.enabled)) {
      if (!stageIds.has(node.stageId)) throw new Error(`Missing campaign stage: ${node.stageId}`);
    }
  }
}
fs.mkdirSync(path.join(target, 'data'), { recursive: true });
// One snapshot per line keeps this generated file compact and preserves source objects.
const body = Object.entries(data).map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`);
fs.writeFileSync(path.join(target, 'data', 'published.json'), `{\n${body.join(',\n')}\n}\n`);
const ts = require('typescript');
const configCache = new Map();
function sourceConfig(name) {
  if (configCache.has(name)) return configCache.get(name);
  const source = fs.readFileSync(path.join(root, 'src', 'data', name + '.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const module = { exports: {} };
  configCache.set(name, module.exports);
  new Function('require', 'module', 'exports', compiled.outputText)(
    request => sourceConfig(request.replace(/^\.\//, '')), module, module.exports);
  return module.exports;
}
const equipment = sourceConfig('EquipmentConfig');
const enhance = sourceConfig('EquipmentEnhance');
const growth = {
  source: 'src/data/*.ts', equipment: equipment.EQUIPMENT_CONFIGS,
  runes: sourceConfig('RuneConfig').RUNE_CONFIGS, sets: equipment.EQUIPMENT_SETS,
  rarity_colors: equipment.RARITY_COLOR, rarity_names: equipment.RARITY_NAME,
  slot_names: equipment.SLOT_NAME, mecha: sourceConfig('MechaConfig').MECHA_CONFIGS,
  skills: sourceConfig('SkillConfig').SKILL_CONFIGS, enhance_costs: {}, disassemble_rewards: {},
};
for (const rarity of ['common', 'rare', 'epic']) {
  const configId = Object.values(growth.equipment).find(item => item.rarity === rarity).id;
  growth.enhance_costs[rarity] = Array.from({ length: 10 }, (_, level) => enhance.getEnhanceCost({ configId, level }));
  growth.disassemble_rewards[rarity] = Array.from({ length: 11 }, (_, level) => enhance.getDisassembleReward({ configId, level }).enhanceStone);
}
const runeIcons = { cannon_rune_1: 'cannon_rune', shield_rune_1: 'shield_rune', poison_guard_rune: 'poison_guard', fire_guard_rune: 'fire_guard' };
for (const [kind, configs] of [['equip', growth.equipment], ['rune', growth.runes]]) {
  for (const config of Object.values(configs)) {
    const filename = `${kind}_${kind === 'rune' ? runeIcons[config.id] : config.id}.png`;
    const output = path.join(target, 'assets', 'imported', 'growth', filename);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.copyFileSync(path.join(root, 'assets', filename), output);
    config.icon_path = `res://assets/imported/growth/${filename}`;
  }
}
fs.writeFileSync(path.join(target, 'data', 'growth.json'), JSON.stringify(growth) + '\n');
console.log(`Godot content synced: ${release}, ${data.content.stages.length} stages, ${copied} art files, ${data.animation.clips.length} animation clips.`);
console.log(`Growth synced from TypeScript: ${Object.keys(growth.equipment).length} equipment, ${Object.keys(growth.runes).length} runes, 16 inventory icons.`);
require('./generate-mecha-equipment.cjs');
