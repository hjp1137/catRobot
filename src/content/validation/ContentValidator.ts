import { hasArtResource } from '../../assets/ArtResourceResolver';
import type { ArtResourceKey } from '../../assets/ArtResourceKeys';
import type { ContentDataSet, ContentValidationError, ContentValidationResult } from '../models/ContentTypes';
import { validateStages } from './StageContentValidator';

const FILES = {
  enemy: 'src/content/data/enemies.ts',
  background: 'src/content/data/backgrounds.ts',
  hero: 'src/content/data/heroes.ts',
  stage: 'src/content/data/stages.ts',
} as const;

function push(errors: ContentValidationError[], file: string, objectId: string, field: string, reason: string): void {
  errors.push({ file, objectId, field, reason });
}

function generic(errors: ContentValidationError[], file: string, items: Array<{ id: string; name: string; enabled: boolean; version: number }>): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.id) push(errors, file, '(empty)', 'id', '不能为空');
    else if (seen.has(item.id)) push(errors, file, item.id, 'id', '重复');
    seen.add(item.id);
    if (!item.name) push(errors, file, item.id, 'name', '不能为空');
    if (typeof item.enabled !== 'boolean') push(errors, file, item.id, 'enabled', '必须是 boolean');
    if (!Number.isFinite(item.version) || item.version < 1) push(errors, file, item.id, 'version', '必须大于等于 1');
  }
}

function art(errors: ContentValidationError[], file: string, objectId: string, field: string, key?: ArtResourceKey): void {
  if (key && !hasArtResource(key)) push(errors, file, objectId, field, `Art Key 不存在：${key}`);
}

export function validateContentData(data: ContentDataSet): ContentValidationResult {
  const errors: ContentValidationError[] = [];
  generic(errors, FILES.enemy, data.enemies);
  generic(errors, FILES.background, data.backgrounds);
  generic(errors, FILES.hero, data.heroes);
  generic(errors, FILES.stage, data.stages);
  validateEnemies(data, errors);
  validateBackgrounds(data, errors);
  validateHeroes(data, errors);
  validateStages(data, errors);
  validateAnimations(data, errors);
  return { valid: errors.length === 0, errors };
}

function validateEnemies(data: ContentDataSet, errors: ContentValidationError[]): void {
  for (const e of data.enemies) {
    if (e.stats.maxHp <= 0) push(errors, FILES.enemy, e.id, 'stats.maxHp', '必须大于 0');
    if (e.stats.attack < 0) push(errors, FILES.enemy, e.id, 'stats.attack', '必须大于等于 0');
    if (e.stats.moveSpeed < 0) push(errors, FILES.enemy, e.id, 'stats.moveSpeed', '必须大于等于 0');
    if (e.combat.attackInterval <= 0) push(errors, FILES.enemy, e.id, 'combat.attackInterval', '必须大于 0');
    if (e.visual.displayScale <= 0) push(errors, FILES.enemy, e.id, 'visual.displayScale', '必须大于 0');
    art(errors, FILES.enemy, e.id, 'visual.iconArtKey', e.visual.iconArtKey);
    art(errors, FILES.enemy, e.id, 'visual.idleArtKey', e.visual.idleArtKey);
    art(errors, FILES.enemy, e.id, 'visual.moveArtKey', e.visual.moveArtKey);
    art(errors, FILES.enemy, e.id, 'visual.attackArtKey', e.visual.attackArtKey);
  }
}

function validateBackgrounds(data: ContentDataSet, errors: ContentValidationError[]): void {
  for (const bg of data.backgrounds) {
    art(errors, FILES.background, bg.id, 'art.floorArtKey', bg.art.floorArtKey);
    art(errors, FILES.background, bg.id, 'art.lineArtKey', bg.art.lineArtKey);
    art(errors, FILES.background, bg.id, 'art.boundaryArtKey', bg.art.boundaryArtKey);
    art(errors, FILES.background, bg.id, 'art.zoneMarkArtKey', bg.art.zoneMarkArtKey);
    for (const [i, key] of (bg.art.decorationArtKeys ?? []).entries()) art(errors, FILES.background, bg.id, `art.decorationArtKeys[${i}]`, key);
    if ((bg.rendering.tileWidth ?? 1) <= 0) push(errors, FILES.background, bg.id, 'rendering.tileWidth', '必须大于 0');
    if ((bg.rendering.tileHeight ?? 1) <= 0) push(errors, FILES.background, bg.id, 'rendering.tileHeight', '必须大于 0');
    for (const f of ['opacity', 'overlayOpacity'] as const) {
      const value = bg.rendering[f];
      if (value !== undefined && (value < 0 || value > 1)) push(errors, FILES.background, bg.id, `rendering.${f}`, '必须在 0 到 1 之间');
    }
  }
}

function validateHeroes(data: ContentDataSet, errors: ContentValidationError[]): void {
  for (const h of data.heroes) {
    if (h.visual.displayScale <= 0) push(errors, FILES.hero, h.id, 'visual.displayScale', '必须大于 0');
    art(errors, FILES.hero, h.id, 'visual.idleArtKey', h.visual.idleArtKey);
    art(errors, FILES.hero, h.id, 'visual.moveArtKey', h.visual.moveArtKey);
    art(errors, FILES.hero, h.id, 'visual.attackArtKey', h.visual.attackArtKey);
    art(errors, FILES.hero, h.id, 'skills.shieldIconArtKey', h.skills.shieldIconArtKey);
    art(errors, FILES.hero, h.id, 'skills.cannonIconArtKey', h.skills.cannonIconArtKey);
  }
}

function validateAnimations(data: ContentDataSet, errors: ContentValidationError[]): void {
  const clips = data.animationClips ?? [];
  const clipKeys = new Set(clips.map(clip => clip.key));
  for (const clip of clips) {
    if (!clip.key) push(errors, 'src/content/data/animations.ts', '(empty)', 'key', '不能为空');
    if (!clip.frames.length) push(errors, 'src/content/data/animations.ts', clip.key, 'frames', '至少一帧');
    if (clip.defaultFps !== undefined && clip.defaultFps <= 0) push(errors, 'src/content/data/animations.ts', clip.key, 'defaultFps', '必须大于 0');
    if (clip.defaultFrameDurationMs !== undefined && clip.defaultFrameDurationMs <= 0) push(errors, 'src/content/data/animations.ts', clip.key, 'defaultFrameDurationMs', '必须大于 0');
    for (const [i, frame] of clip.frames.entries()) {
      if (frame.durationMs !== undefined && frame.durationMs <= 0) push(errors, 'src/content/data/animations.ts', clip.key, `frames[${i}].durationMs`, '必须大于 0');
      art(errors, 'src/content/data/animations.ts', clip.key, `frames[${i}].artKey`, frame.artKey);
    }
  }
  for (const e of data.enemies) validateClipBindings(errors, 'src/content/data/enemies.ts', e.id, e.visual.animationClipKeys, clipKeys);
  for (const h of data.heroes) validateClipBindings(errors, 'src/content/data/heroes.ts', h.id, h.visual.animationClipKeys, clipKeys);
}

function validateClipBindings(errors: ContentValidationError[], file: string, objectId: string, bindings: Partial<Record<string, string>> | undefined, clipKeys: Set<string>): void {
  for (const [state, key] of Object.entries(bindings ?? {})) {
    if (!key) continue;
    if (!clipKeys.has(key)) push(errors, file, objectId, `visual.animationClipKeys.${state}`, `Animation Clip 不存在：${key}`);
  }
}
