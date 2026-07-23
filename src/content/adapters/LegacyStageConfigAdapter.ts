import type { StageConfig, StageWaveConfig } from '../../data/StageConfig';
import { getDefaultContentRegistry } from '../registry/ContentRegistry';
import type { StageDefinition } from '../models/StageDefinition';
import { getLegacyEnemyIdForTemplate } from './EnemyTemplateAdapter';

export type StageConfigBase = Omit<StageConfig, 'enemies' | 'waves'>;

export function getContentStageDefinition(id: string): StageDefinition {
  return getDefaultContentRegistry().getStage(id);
}

export function createLegacyStageConfigFromContent(contentStageId: string, base: StageConfigBase): StageConfig {
  const stage = getContentStageDefinition(contentStageId);
  if (!stage.waves?.length) {
    throw new Error(`[LegacyStageConfigAdapter] ${contentStageId} 缺少旧固定屏入口所需的波次配置`);
  }
  return {
    ...base,
    enemies: [],
    waves: stage.waves.map(toLegacyWave),
    contentStageId: stage.id,
    backgroundThemeId: stage.backgroundThemeId,
    heroVisualTemplateId: stage.heroVisualTemplateId,
  };
}

function toLegacyWave(wave: NonNullable<StageDefinition['waves']>[number]): StageWaveConfig {
  return {
    id: wave.id ?? `wave-${wave.wave}`,
    name: wave.name,
    message: wave.message,
    spawnDelay: wave.spawnDelay,
    enemies: wave.groups.map(group => ({
      enemyId: getLegacyEnemyIdForTemplate(group.enemyTemplateId),
      enemyTemplateId: group.enemyTemplateId,
      count: group.count,
      spawnGroup: group.spawnGroup,
      levelMultiplier: group.levelMultiplier,
    })),
  };
}
