import { ConflictException } from '@nestjs/common';

export function validateClip(body: any) {
  if (!body.clipKey || !body.name || !body.targetType || !body.state) throw new ConflictException('动画片段基础字段不完整。');
  if (!['enemy', 'hero', 'effect'].includes(body.targetType)) throw new ConflictException('targetType 不合法。');
  if (!['loop', 'once', 'hold-last-frame'].includes(body.playMode)) throw new ConflictException('playMode 不合法。');
  if (!Array.isArray(body.frames) || body.frames.length < 1) throw new ConflictException('动画片段至少需要一帧。');
  for (const frame of body.frames) {
    if (!frame.artKey || (frame.durationMs != null && frame.durationMs <= 0)) throw new ConflictException('动画帧不合法。');
  }
}

export function clipData(body: any, creating: boolean) {
  return {
    clip_key: creating ? body.clipKey : undefined,
    name: body.name,
    target_type: body.targetType,
    state: body.state,
    default_fps: body.defaultFps,
    default_frame_duration_ms: body.defaultFrameDurationMs,
    loop: body.loop ?? body.playMode === 'loop',
    play_mode: body.playMode,
    end_behavior: body.endBehavior ?? 'hold-last-frame',
    enabled: body.enabled ?? true,
    content_version: body.version ?? 1,
  };
}

export function frameData(clipId: string, frames: any[]) {
  return frames.map((frame, index) => ({
    clip_id: clipId,
    sort_order: frame.order ?? index,
    art_key: frame.artKey,
    duration_ms: frame.durationMs,
    offset_x: frame.offsetX,
    offset_y: frame.offsetY,
    scale: frame.scale,
    flip_x: frame.flipX ?? false,
    note: frame.note,
  }));
}

export function clipFromRow(row: any) {
  return {
    id: row.id,
    clipKey: row.clip_key,
    key: row.clip_key,
    name: row.name,
    targetType: row.target_type,
    state: row.state,
    defaultFps: row.default_fps,
    defaultFrameDurationMs: row.default_frame_duration_ms,
    loop: row.loop,
    playMode: row.play_mode,
    endBehavior: row.end_behavior,
    enabled: row.enabled,
    version: row.content_version,
    rowVersion: row.row_version,
    updatedAt: row.updated_at,
    frames: (row.frames ?? []).map(frameFromRow),
  };
}

export function clipRefs(type: string, rows: any[], clipKey: string) {
  return rows.flatMap(row => Object.entries(row.visual_json?.animationClipKeys ?? {})
    .filter(([, key]) => key === clipKey)
    .map(([state]) => ({ type, id: row.id, name: row.name, state })));
}

export function containsValue(value: unknown, needle: string): boolean {
  if (value === needle) return true;
  if (Array.isArray(value)) return value.some(item => containsValue(item, needle));
  if (value && typeof value === 'object') return Object.values(value).some(item => containsValue(item, needle));
  return false;
}

function frameFromRow(row: any) {
  return { id: row.id, order: row.sort_order, artKey: row.art_key, durationMs: row.duration_ms, offsetX: row.offset_x, offsetY: row.offset_y, scale: row.scale, flipX: row.flip_x, note: row.note };
}
