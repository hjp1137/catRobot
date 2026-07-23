import type { ContentDataSet, ContentValidationError } from '../models/ContentTypes';

const STAGE_FILE = 'src/content/data/stages.ts';

function push(errors: ContentValidationError[], objectId: string, field: string, reason: string): void {
  errors.push({ file: STAGE_FILE, objectId, field, reason });
}

function ref<T extends { enabled: boolean }>(
  errors: ContentValidationError[],
  objectId: string,
  field: string,
  id: string,
  map: Map<string, T>,
  label: string,
): void {
  const value = map.get(id);
  if (!value) push(errors, objectId, field, `${label}不存在：${id}`);
  else if (!value.enabled) push(errors, objectId, field, `${label}已禁用：${id}`);
}

export function validateStages(data: ContentDataSet, errors: ContentValidationError[]): void {
  const enemies = new Map(data.enemies.map(e => [e.id, e]));
  const backgrounds = new Map(data.backgrounds.map(b => [b.id, b]));
  const heroes = new Map(data.heroes.map(h => [h.id, h]));
  for (const s of data.stages) {
    ref(errors, s.id, 'backgroundThemeId', s.backgroundThemeId, backgrounds, '背景主题');
    ref(errors, s.id, 'heroVisualTemplateId', s.heroVisualTemplateId, heroes, '主角模板');
    if (s.mode === 'fixed-battle' && (!s.waves || s.waves.length === 0)) push(errors, s.id, 'waves', '固定屏关卡必须配置 waves');
    if (s.mode === 'explore' && !s.exploration) push(errors, s.id, 'exploration', '探索关卡必须配置 exploration');
    s.waves?.forEach((w, wi) => w.groups.forEach((g, gi) => {
      if (g.count <= 0) push(errors, s.id, `waves[${wi}].groups[${gi}].count`, '必须大于 0');
      ref(errors, s.id, `waves[${wi}].groups[${gi}].enemyTemplateId`, g.enemyTemplateId, enemies, '敌人模板');
    }));
    s.exploration?.spawnGroups.forEach((g, i) => {
      ref(errors, s.id, `exploration.spawnGroups[${i}].enemyTemplateId`, g.enemyTemplateId, enemies, '敌人模板');
      if (g.initialCount < 0 || g.maxAlive <= 0 || g.respawnInterval <= 0) push(errors, s.id, `exploration.spawnGroups[${i}]`, '刷新数量和间隔必须有效');
      const p = g.spawnPoint, ew = s.exploration!.worldWidth, eh = s.exploration!.worldHeight;
      if (p.x < 0 || p.x > ew || p.y < 0 || p.y > eh) push(errors, s.id, `exploration.spawnGroups[${i}].spawnPoint`, '坐标超出世界范围');
    });
  }
}
