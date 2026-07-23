import type { StageRect } from '../content/models/StageOrchestration';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface StageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function fitStageToViewport(stage: ViewportSize, viewport: ViewportSize): StageTransform {
  const scale = Math.min(viewport.width / stage.width, viewport.height / stage.height);
  return {
    scale,
    offsetX: (viewport.width - stage.width * scale) / 2,
    offsetY: (viewport.height - stage.height * scale) / 2,
  };
}

export function stageToViewport(point: { x: number; y: number }, transform: StageTransform) {
  return {
    x: point.x * transform.scale + transform.offsetX,
    y: point.y * transform.scale + transform.offsetY,
  };
}

export function viewportToStage(point: { x: number; y: number }, transform: StageTransform) {
  return {
    x: (point.x - transform.offsetX) / transform.scale,
    y: (point.y - transform.offsetY) / transform.scale,
  };
}

export function containsStagePoint(rect: StageRect, point: { x: number; y: number }): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}
