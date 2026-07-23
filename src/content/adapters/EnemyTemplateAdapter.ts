import type { EnemyConfig, EnemyVariant } from '../../data/EnemyConfig';
import type { EnemyTemplate } from '../models/EnemyTemplate';

const LEGACY_ENEMY_IDS: Record<string, string> = {
  enemy_scrap_mouse_01: 'mouse',
  enemy_scrap_bug_01: 'mechanical_beetle',
  enemy_drone_eye_01: 'toxic_mecha_bug',
  enemy_scrap_guard_elite_01: 'elite_mouse',
};

const TEMPLATE_IDS_BY_LEGACY_ENEMY: Record<string, string> = {
  mouse: 'enemy_scrap_mouse_01', mechanical_beetle: 'enemy_scrap_bug_01',
  toxic_mecha_bug: 'enemy_drone_eye_01', elite_mouse: 'enemy_scrap_guard_elite_01',
};

const LEGACY_VARIANTS: Record<string, EnemyVariant> = {
  enemy_scrap_mouse_01: 'normal',
  enemy_scrap_bug_01: 'beetle',
  enemy_drone_eye_01: 'normal',
  enemy_scrap_guard_elite_01: 'elite',
};

const COLORS: Record<string, string> = {
  normal: '#6b7a99',
  beetle: '#5a6b3a',
  elite: '#3d4760',
};

export function getLegacyEnemyIdForTemplate(templateId: string): string {
  return LEGACY_ENEMY_IDS[templateId] ?? templateId;
}

export function getTemplateIdForLegacyEnemy(legacyEnemyId: string): string {
  return TEMPLATE_IDS_BY_LEGACY_ENEMY[legacyEnemyId]
    ?? (legacyEnemyId.includes('elite') || legacyEnemyId.includes('boss')
      ? 'enemy_scrap_guard_elite_01' : 'enemy_scrap_mouse_01');
}

export function createEnemyConfigFromTemplate(template: EnemyTemplate, levelMultiplier = 1): EnemyConfig {
  const variant = LEGACY_VARIANTS[template.id] ?? (template.category === 'elite' ? 'elite' : 'normal');
  const color = COLORS[variant] ?? COLORS.normal;
  return {
    id: getLegacyEnemyIdForTemplate(template.id),
    name: template.name,
    maxHp: Math.round(template.stats.maxHp * levelMultiplier),
    attack: Math.round(template.stats.attack * levelMultiplier),
    attackInterval: template.combat.attackInterval,
    speed: template.stats.moveSpeed,
    radius: template.visual.collisionRadius,
    color,
    variant,
    contentTemplateId: template.id,
    visual: template.visual,
    behaviorType: template.behaviorType,
  };
}
