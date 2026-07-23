export interface WorldPoint {
  x: number;
  y: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface CameraState {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  worldWidth: number;
  worldHeight: number;
}

export interface CameraFollowOptions {
  followLerp?: number;
  targetOffsetY?: number;
}

export function createCameraState(
  viewportWidth: number,
  viewportHeight: number,
  worldWidth: number,
  worldHeight: number,
): CameraState {
  return clampCamera({ x: 0, y: 0, viewportWidth, viewportHeight, worldWidth, worldHeight });
}

export function clampValue(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function clampCamera(camera: CameraState): CameraState {
  const maxX = Math.max(0, camera.worldWidth - camera.viewportWidth);
  const maxY = Math.max(0, camera.worldHeight - camera.viewportHeight);
  return {
    ...camera,
    x: clampValue(camera.x, 0, maxX),
    y: clampValue(camera.y, 0, maxY),
  };
}

export function followCameraToPoint(
  camera: CameraState,
  point: WorldPoint,
  options: CameraFollowOptions = {},
): CameraState {
  const lerp = options.followLerp ?? 1;
  const offsetY = options.targetOffsetY ?? 80;
  const targetX = point.x - camera.viewportWidth / 2;
  const targetY = point.y - camera.viewportHeight / 2 - offsetY;
  const nextX = camera.x + (targetX - camera.x) * lerp;
  const nextY = camera.y + (targetY - camera.y) * lerp;
  return clampCamera({ ...camera, x: Math.round(nextX), y: Math.round(nextY) });
}

export function worldToScreen(camera: CameraState, point: WorldPoint): ScreenPoint {
  return { x: point.x - camera.x, y: point.y - camera.y };
}

export function screenToWorld(camera: CameraState, point: ScreenPoint): WorldPoint {
  return { x: point.x + camera.x, y: point.y + camera.y };
}

export function clampWorldPoint(point: WorldPoint, worldWidth: number, worldHeight: number, radius = 0): WorldPoint {
  return {
    x: clampValue(point.x, radius, worldWidth - radius),
    y: clampValue(point.y, radius, worldHeight - radius),
  };
}
