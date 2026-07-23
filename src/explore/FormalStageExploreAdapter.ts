import type { StageConfig } from '../data/StageConfig';
import { getTemplateIdForLegacyEnemy } from '../content/adapters/EnemyTemplateAdapter';
import type { StageDefinition } from '../content/models/StageDefinition';

/** 将尚未拥有独立内容快照的旧章节关卡适配为正式自由地图参数。 */
export function createFormalExploreStage(stage: StageConfig, content?: StageDefinition): StageDefinition {
  const groups = stage.waves?.length
    ? stage.waves.reduce((all, wave) => all.concat(wave.enemies), [] as StageConfig['enemies'])
    : stage.enemies;
  const totalEnemies = groups.reduce((sum, group) => sum + group.count, 0);
  return {
    id: content?.id ?? `legacy_explore_${stage.id}`,
    legacyStageId: stage.id,
    name: stage.name,
    mode: 'explore', enabled: true, version: content?.version ?? 1,
    heroVisualTemplateId: content?.heroVisualTemplateId ?? stage.heroVisualTemplateId ?? 'hero_mecha_cat_default',
    backgroundThemeId: content?.backgroundThemeId ?? stage.backgroundThemeId ?? 'background_training_ground_v1',
    exploration: {
      worldWidth: 1800, worldHeight: 2800,
      spawnGroups: groups.map((group, index) => ({
        id: `${stage.id}_group_${index + 1}`,
        enemyTemplateId: group.enemyTemplateId ?? getTemplateIdForLegacyEnemy(group.enemyId),
        spawnPoint: { x: 360 + (index % 3) * 540, y: 680 + Math.floor(index / 3) * 720, radius: 150 },
        initialCount: Math.min(group.count, 4), maxAlive: Math.min(group.count, 4),
        respawnInterval: 900, active: group.count > 0,
      })),
    },
    waves: (stage.waves?.length ? stage.waves : [{ id: `${stage.id}_wave_1`, enemies: stage.enemies }]).map((wave, waveIndex) => ({
      id: wave.id, name: wave.name, message: wave.message, wave: waveIndex + 1, spawnDelay: wave.spawnDelay,
      groups: wave.enemies.map(group => ({
        enemyTemplateId: group.enemyTemplateId ?? getTemplateIdForLegacyEnemy(group.enemyId),
        count: group.count, spawnGroup: group.spawnGroup, levelMultiplier: group.levelMultiplier,
      })),
    })),
    objectives: [{ type: 'defeat', required: totalEnemies }],
  };
}
