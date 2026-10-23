type EnemyId = 'enemy_scrap_mouse_01' | 'enemy_scrap_bug_01' | 'enemy_drone_eye_01' | 'enemy_scrap_guard_elite_01' | 'enemy_scrap_mouse_king_01';

interface ChapterStageMeta {
  id: string;
  legacyStageId: string;
  name: string;
  description: string;
  order: number;
  power: number;
  waveCount: number;
  boss?: boolean;
}

const META: ChapterStageMeta[] = [
  { id: 'stage_battle_1_1', legacyStageId: '1-1', name: '铸造入口', description: '恢复边境入口供能并清除基础鼠群。', order: 1, power: 220, waveCount: 3 },
  { id: 'stage_ch1_02', legacyStageId: '1-2', name: '锈蚀通道', description: '突破狭窄通道中的双向夹击。', order: 2, power: 270, waveCount: 3 },
  { id: 'stage_ch1_03', legacyStageId: '1-3', name: '废料堆伏击', description: '在多入口废料堆中应对连续伏击。', order: 3, power: 330, waveCount: 3 },
  { id: 'stage_ch1_04', legacyStageId: '1-4', name: '能源仓警报', description: '压制远程侦察机并保护能源仓。', order: 4, power: 400, waveCount: 4 },
  { id: 'stage_ch1_05', legacyStageId: '1-5', name: '维修平台', description: '击破首次出现的精英守卫。', order: 5, power: 480, waveCount: 4 },
  { id: 'stage_ch1_06', legacyStageId: '1-6', name: '磁轨中继站', description: '在快速增援中夺回磁轨中继。', order: 6, power: 570, waveCount: 4 },
  { id: 'stage_ch1_07', legacyStageId: '1-7', name: '冷却管廊', description: '穿过高密度巡逻与远程火力网。', order: 7, power: 670, waveCount: 4 },
  { id: 'stage_ch1_08', legacyStageId: '1-8', name: '废料熔解区', description: '承受熔解区精英集群的持续压力。', order: 8, power: 780, waveCount: 4 },
  { id: 'stage_ch1_09', legacyStageId: '1-9', name: '鼠王前哨', description: '击溃首领前哨与复合护卫。', order: 9, power: 900, waveCount: 4 },
  { id: 'stage_ch1_10', legacyStageId: '1-10', name: '边境核心·机械鼠王', description: '摧毁机械鼠王，重启废料边境核心。', order: 10, power: 1080, waveCount: 5, boss: true },
];

export const CHAPTER_ONE_CAMPAIGN = {
  id: 'campaign_main_01', chapterId: 'chapter_scrap_border_01', chapterNo: 1,
  name: '喵喵机甲主线战役', subtitle: '星核觉醒', chapterName: '第一章·废料边境',
  description: '沿废料边境十处防线推进，最终击败机械鼠王。',
};

const HUD = {
  layout: 'tactical', theme: 'industrial', showWaveNotice: false,
  skillButtonShape: 'hex', skillButtonSize: 68, skillButtonGap: 14,
  skillButtonRight: 18, skillButtonBottom: 24, showSkillLabels: true,
  panelOpacity: 0.82,
};

const TOP_DOWN_MAP_LAYERS = [
  { id: 'stage-map', name: '俯视工业战术地图', type: 'ground', artKey: 'map.trainingGround.overhead', order: 0, x: 0, y: 0, width: 1800, height: 2800, scale: 1, opacity: 1, tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true },
  { id: 'press-blocker', name: '中央压装台', type: 'collision', order: 1, x: 600, y: 280, width: 600, height: 820, scale: 1, opacity: 0, tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true },
  { id: 'cargo-blocker', name: '左侧货箱区', type: 'collision', order: 2, x: 70, y: 1040, width: 450, height: 840, scale: 1, opacity: 0, tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true },
  { id: 'generator-blocker', name: '右侧发电机', type: 'collision', order: 3, x: 1190, y: 1160, width: 480, height: 740, scale: 1, opacity: 0, tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true },
  { id: 'barrier-blocker', name: '下方检修栏', type: 'collision', order: 4, x: 500, y: 2200, width: 760, height: 250, scale: 1, opacity: 0, tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true },
] as const;

export const CHAPTER_ONE_STAGES = META.map(meta => buildStage(meta));

function buildStage(meta: ChapterStageMeta) {
  const waves = buildWaves(meta);
  return {
    ...meta,
    mode: 'explore',
    heroVisualTemplateId: 'hero_mecha_cat_default',
    backgroundThemeId: 'background_training_ground_v1',
    worldWidth: 1800,
    worldHeight: 2800,
    exploration: buildExploration(meta),
    waves,
    objectives: [{ type: 'defeat', required: waves.flatMap(wave => wave.entries).reduce((sum, entry) => sum + entry.count, 0) }],
    orchestration: {
      layout: {
        canvasWidth: 1800, canvasHeight: 2800, sceneMode: 'exploration',
        backgroundThemeId: 'background_training_ground_v1', heroSpawnPointId: 'hero_start',
        battleArea: { x: 0, y: 0, width: 1800, height: 2800 },
        camera: { mode: 'follow', clampToWorld: true }, exploreHud: { ...HUD }, enabled: true,
      },
      layers: TOP_DOWN_MAP_LAYERS.map(layer => ({ ...layer })),
      spawnPoints: [
        { id: 'hero_start', name: '主角出生点', type: 'hero', x: 900, y: 2380, facing: 'up', enabled: true },
        { id: 'enemy_left', name: '西侧入口', type: 'enemy', x: 300, y: 760, facing: 'right', enabled: true },
        { id: 'enemy_right', name: '东侧入口', type: 'enemy', x: 1500, y: 980, facing: 'left', enabled: true },
        { id: 'enemy_top', name: '北侧入口', type: 'enemy', x: 900, y: 380, facing: 'down', enabled: true },
      ],
      waves,
      completionRule: { type: 'all-waves-cleared' }, failureRule: { type: 'hero-dead' },
    },
    progression: buildProgression(meta),
  };
}

function buildExploration(meta: ChapterStageMeta) {
  const roster: EnemyId[] = [
    'enemy_scrap_mouse_01',
    meta.order >= 3 ? 'enemy_scrap_bug_01' : 'enemy_scrap_mouse_01',
    meta.order >= 4 ? 'enemy_drone_eye_01' : 'enemy_scrap_mouse_01',
    meta.boss ? 'enemy_scrap_mouse_king_01' : meta.order >= 5 ? 'enemy_scrap_guard_elite_01' : 'enemy_scrap_mouse_01',
  ];
  const positions = [[360, 620], [1320, 1080], [520, 1660], [1180, 2240]];
  return {
    worldWidth: 1800, worldHeight: 2800,
    spawnGroups: roster.map((enemyTemplateId, index) => {
      const boss = enemyTemplateId === 'enemy_scrap_mouse_king_01';
      return {
        id: `chapter_${meta.order}_zone_${index + 1}`, enemyTemplateId,
        spawnPoint: { x: positions[index][0], y: positions[index][1], radius: boss ? 220 : 170 },
        initialCount: boss ? 1 : Math.min(2 + Math.floor(meta.order / 4), 4),
        maxAlive: boss ? 1 : Math.min(3 + Math.floor(meta.order / 3), 6),
        respawnInterval: boss ? 30000 : 5200 + index * 900,
        active: true,
      };
    }),
    resourcePointIds: [`chapter_${meta.order}_energy`, `chapter_${meta.order}_parts`],
    chestIds: [`chapter_${meta.order}_chest`],
  };
}

function buildWaves(meta: ChapterStageMeta) {
  const roster: EnemyId[] = [
    'enemy_scrap_mouse_01', 'enemy_scrap_bug_01',
    'enemy_drone_eye_01', 'enemy_scrap_guard_elite_01',
  ];
  return Array.from({ length: meta.waveCount }, (_, index) => {
    const order = index + 1;
    const finale = order === meta.waveCount;
    const bossEntry = Boolean(meta.boss && finale);
    const enemy = bossEntry ? 'enemy_scrap_mouse_king_01' : roster[Math.min(3, Math.floor((meta.order + index - 2) / 2))];
    const multiplier = Number((1 + (meta.order - 1) * 0.1 + index * 0.08 + (bossEntry ? 1 : 0)).toFixed(2));
    return {
      id: `wave_${order}`, order, name: bossEntry ? '首领：机械鼠王' : `第${order}波 ${waveTitle(enemy)}`,
      startTrigger: { type: order === 1 ? 'stage-start' : 'previous-wave-cleared' }, startDelayMs: order === 1 ? 0 : 700,
      entries: [{ id: `entry_${order}`, enemyTemplateId: enemy, spawnPointId: ['enemy_left','enemy_right','enemy_top'][index % 3], count: bossEntry ? 1 : Math.min(3 + Math.floor(meta.order / 2) + index, 8), spawnIntervalMs: bossEntry ? 0 : 420, initialDelayMs: 0, elite: enemy === 'enemy_scrap_guard_elite_01' || bossEntry, levelMultiplier: multiplier, hpMultiplier: bossEntry ? multiplier * 1.6 : multiplier, attackMultiplier: multiplier, enabled: true }],
      maxAlive: bossEntry ? 1 : Math.min(5 + Math.floor(meta.order / 3), 8), completionRule: { type: 'all-enemies-cleared' }, completionDelayMs: 650,
      nextWave: finale ? 'stage-clear' : 'next', enabled: true,
    };
  });
}

function buildProgression(meta: ChapterStageMeta) {
  const next = META[meta.order];
  return {
    recommendedPower: meta.power,
    victoryText: meta.boss ? '机械鼠王已被摧毁，废料边境核心重新启动' : `${meta.name}已净化`,
    failureText: '机甲核心失稳，请调整配置后重新挑战',
    objectives: [
      { id: 'clear_all', name: '区域净化', type: 'clear-all-waves', required: true, params: {}, displayText: `清除全部${meta.waveCount}波敌人`, progressDisplay: 'waves', starEligible: true },
      { id: 'fast_clear', name: '战术速攻', type: 'complete-within-duration', required: false, params: { maxDurationSec: 80 + meta.order * 8 }, displayText: `${80 + meta.order * 8}秒内完成`, progressDisplay: 'timer', starEligible: true },
      { id: 'healthy_clear', name: '装甲完整', type: 'hero-health-above', required: false, params: { minHealthRatio: meta.boss ? 0.35 : 0.5 }, displayText: `结束时生命不低于${meta.boss ? 35 : 50}%`, progressDisplay: 'ratio', starEligible: true },
    ],
    rewardPools: [
      { id: 'first_clear', name: '首通补给', group: 'first-clear', entries: [
        { id: 'gold', type: 'currency', ref: 'gold', min: 45 + meta.order * 15, max: 45 + meta.order * 15, probability: 1 },
        { id: 'stone', type: 'material', ref: 'enhanceStone', min: 1 + Math.floor(meta.order / 3), max: 1 + Math.floor(meta.order / 3), probability: 1 },
      ] },
      { id: 'repeat_clear', name: '常规回收', group: 'repeat-clear', entries: [
        { id: 'parts', type: 'currency', ref: 'parts', min: 2 + meta.order, max: 4 + meta.order, probability: 1 },
        { id: 'equipment', type: 'equipment', ref: 'rusty_claw', min: 1, max: 1, probability: Math.min(0.15 + meta.order * 0.02, 0.35) },
      ] },
      { id: 'three_star', name: '三星战术奖励', group: 'first-three-star', entries: [
        { id: 'rune', type: 'rune', ref: 'cannon_rune_1', min: 1, max: 1, probability: 1 },
      ] },
    ],
    unlockRules: [
      ...(meta.order === 1 ? [{ id: 'default_open', type: 'default-unlocked', requiredStars: 0 }] : []),
      ...(next ? [{ id: `unlock_${next.legacyStageId.replace('-', '_')}`, type: 'prerequisite-clear', prerequisiteStageId: meta.id, requiredStars: 1, nextStageId: next.id }] : []),
    ],
  };
}

function waveTitle(enemy: EnemyId): string {
  return ({
    enemy_scrap_mouse_01: '鼠群推进', enemy_scrap_bug_01: '甲虫夹击',
    enemy_drone_eye_01: '侦察火网', enemy_scrap_guard_elite_01: '精英压制',
    enemy_scrap_mouse_king_01: '机械鼠王',
  } as Record<EnemyId, string>)[enemy];
}

const NODE_POSITIONS = [
  [150, 120], [450, 120], [450, 400], [150, 400], [150, 680],
  [450, 680], [450, 960], [150, 960], [150, 1240], [450, 1240],
];

export const CHAPTER_ONE_NODES = META.map((meta, index) => ({
  id: index === 0 ? 'campaign_node_battle_1_1' : index === 1 ? 'campaign_node_training' : `campaign_node_ch1_${String(meta.order).padStart(2, '0')}`,
  stageId: meta.id, name: meta.name, description: meta.description,
  x: NODE_POSITIONS[index][0], y: NODE_POSITIONS[index][1],
  type: meta.boss ? 'boss' : 'normal', iconArtKey: 'icon.objective.enemy',
  isStart: index === 0, isEnd: index === META.length - 1, order: meta.order,
  recommendedPower: meta.power, enabled: true,
}));

export const CHAPTER_ONE_CONNECTIONS = CHAPTER_ONE_NODES.slice(0, -1).map((node, index) => ({
  id: index === 0 ? 'campaign_path_1_1_training' : `campaign_path_ch1_${String(index + 1).padStart(2, '0')}_${String(index + 2).padStart(2, '0')}`,
  fromNodeId: node.id, toNodeId: CHAPTER_ONE_NODES[index + 1].id,
  pathType: 'normal', oneWay: true, order: index + 1, enabled: true,
}));
