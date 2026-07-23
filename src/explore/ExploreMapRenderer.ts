import type { ICanvas2D } from '../engine/IContext';
import { ResourceManager } from '../core/ResourceManager';
import { Theme } from '../render/Theme';
import { CameraState, worldToScreen } from './WorldTransform';
import type { BackgroundTheme } from '../content/models/BackgroundTheme';
import type { StageLayer } from '../content/models/StageOrchestration';

export interface ExploreDecoration {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'crate' | 'pillar' | 'wreck' | 'beacon';
}

export interface ExploreZone {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill: string;
  stroke: string;
}

export const TRAINING_GROUND_ZONES: ExploreZone[] = [
  { x: 90, y: 110, w: 560, h: 420, label: 'A-01', fill: 'rgba(18, 60, 75, 0.34)', stroke: 'rgba(79, 209, 224, 0.34)' },
  { x: 720, y: 250, w: 520, h: 380, label: 'B-02', fill: 'rgba(68, 48, 30, 0.28)', stroke: 'rgba(255, 179, 71, 0.32)' },
  { x: 250, y: 930, w: 660, h: 460, label: 'C-03', fill: 'rgba(35, 49, 60, 0.34)', stroke: 'rgba(79, 209, 224, 0.24)' },
  { x: 1040, y: 1460, w: 520, h: 500, label: 'D-04', fill: 'rgba(42, 32, 54, 0.26)', stroke: 'rgba(160, 96, 224, 0.28)' },
  { x: 360, y: 2180, w: 780, h: 420, label: 'E-05', fill: 'rgba(18, 60, 75, 0.24)', stroke: 'rgba(79, 209, 224, 0.22)' },
];

export const TRAINING_GROUND_DECORATIONS: ExploreDecoration[] = [
  { x: 320, y: 520, w: 70, h: 44, kind: 'crate' },
  { x: 1260, y: 620, w: 54, h: 120, kind: 'pillar' },
  { x: 840, y: 1040, w: 140, h: 56, kind: 'wreck' },
  { x: 1480, y: 1240, w: 46, h: 46, kind: 'beacon' },
  { x: 420, y: 1760, w: 58, h: 112, kind: 'pillar' },
  { x: 1320, y: 2020, w: 96, h: 52, kind: 'crate' },
  { x: 950, y: 2440, w: 150, h: 62, kind: 'wreck' },
  { x: 210, y: 2380, w: 48, h: 48, kind: 'beacon' },
];

export function drawExploreTrainingMap(
  c: ICanvas2D, camera: CameraState, time: number, theme?: BackgroundTheme, layers: readonly StageLayer[] = [],
): void {
  c.save();
  c.fillStyle = theme?.colors?.base ?? '#09171f';
  c.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);
  if (drawConfiguredLayers(c, camera, theme, layers)) { c.restore(); return; }
  drawFloorPlates(c, camera);
  if (theme?.rendering.showGrid !== false) drawGrid(c, camera);
  if (theme?.rendering.showZoneMarks !== false) {
    for (const zone of TRAINING_GROUND_ZONES) drawZone(c, camera, zone);
    drawMapTitle(c, camera);
  }
  if (theme?.rendering.showBoundary !== false) drawWorldBounds(c, camera, time);
  for (const deco of TRAINING_GROUND_DECORATIONS) drawDecoration(c, camera, deco);
  c.restore();
}

function drawConfiguredLayers(c: ICanvas2D, camera: CameraState, theme: BackgroundTheme | undefined, layers: readonly StageLayer[]): boolean {
  const visible = layers.filter(layer => layer.enabled && layer.type !== 'collision').sort((a, b) => a.order - b.order);
  if (!visible.length) return false;
  const resources = ResourceManager.getInstance();
  for (const layer of visible) {
    const artKey = layer.artKey ?? (layer.backgroundThemeId ? theme?.art.backgroundArtKey ?? theme?.art.floorArtKey : undefined);
    const image = artKey ? resources.getImageByArtKey(artKey as any) : undefined;
    if (!image) continue;
    const p = worldToScreen(camera, { x: layer.x, y: layer.y });
    const width = (layer.width ?? camera.worldWidth) * (layer.scale || 1);
    const height = (layer.height ?? camera.worldHeight) * (layer.scale || 1);
    c.save(); c.globalAlpha = layer.opacity ?? 1;
    c.drawImage(image, p.x, p.y, width, height);
    c.restore();
  }
  return true;
}

function drawFloorPlates(c: ICanvas2D, camera: CameraState): void {
  const plate = 240;
  const startX = Math.floor(camera.x / plate) * plate;
  const startY = Math.floor(camera.y / plate) * plate;
  for (let x = startX; x <= camera.x + camera.viewportWidth + plate; x += plate) {
    for (let y = startY; y <= camera.y + camera.viewportHeight + plate; y += plate) {
      const sx = x - camera.x;
      const sy = y - camera.y;
      c.fillStyle = ((x / plate + y / plate) % 2 === 0) ? '#102630' : '#0d2029';
      c.fillRect(sx + 6, sy + 6, plate - 12, plate - 12);
      c.strokeStyle = 'rgba(79,209,224,0.12)';
      c.strokeRect(sx + 6, sy + 6, plate - 12, plate - 12);
    }
  }
}

function drawZone(c: ICanvas2D, camera: CameraState, zone: ExploreZone): void {
  const p = worldToScreen(camera, zone);
  if (p.x > camera.viewportWidth + 80 || p.y > camera.viewportHeight + 80 || p.x + zone.w < -80 || p.y + zone.h < -80) return;
  c.fillStyle = zone.fill;
  c.strokeStyle = zone.stroke;
  c.lineWidth = 2;
  c.fillRect(p.x, p.y, zone.w, zone.h);
  c.strokeRect(p.x, p.y, zone.w, zone.h);
  c.fillStyle = 'rgba(230, 247, 255, 0.42)';
  c.font = Theme.font.bodyBold;
  c.fillText(zone.label, p.x + 18, p.y + 22);
}

function drawMapTitle(c: ICanvas2D, camera: CameraState): void {
  const p = worldToScreen(camera, { x: 82, y: 66 });
  if (p.x < -160 || p.y < -80 || p.x > camera.viewportWidth + 80 || p.y > camera.viewportHeight + 80) return;
  c.fillStyle = 'rgba(255, 179, 71, 0.58)';
  c.font = Theme.font.bodyBold;
  c.fillText('训练场', p.x, p.y);
}

function drawGrid(c: ICanvas2D, camera: CameraState): void {
  const step = 120;
  const startX = Math.floor(camera.x / step) * step;
  const startY = Math.floor(camera.y / step) * step;
  c.strokeStyle = 'rgba(79, 209, 224, 0.18)';
  c.lineWidth = 1;
  for (let x = startX; x <= camera.x + camera.viewportWidth + step; x += step) {
    const sx = x - camera.x;
    c.beginPath(); c.moveTo(sx, 0); c.lineTo(sx, camera.viewportHeight); c.stroke();
  }
  for (let y = startY; y <= camera.y + camera.viewportHeight + step; y += step) {
    const sy = y - camera.y;
    c.beginPath(); c.moveTo(0, sy); c.lineTo(camera.viewportWidth, sy); c.stroke();
  }
  c.strokeStyle = 'rgba(255, 179, 71, 0.16)';
  for (let y = startY; y <= camera.y + camera.viewportHeight + step; y += step * 2) {
    const sy = y - camera.y + 28;
    c.beginPath(); c.moveTo(0, sy); c.lineTo(camera.viewportWidth, sy); c.stroke();
  }
}

function drawWorldBounds(c: ICanvas2D, camera: CameraState, time: number): void {
  const p = worldToScreen(camera, { x: 0, y: 0 });
  c.strokeStyle = time % 1 > 0.5 ? Theme.color.gold : Theme.color.orange;
  c.lineWidth = 4;
  c.strokeRect(p.x, p.y, camera.worldWidth, camera.worldHeight);
}

function drawDecoration(c: ICanvas2D, camera: CameraState, deco: ExploreDecoration): void {
  const p = worldToScreen(camera, deco);
  if (p.x > camera.viewportWidth + 80 || p.y > camera.viewportHeight + 80 || p.x + deco.w < -80 || p.y + deco.h < -80) return;
  if (deco.kind === 'beacon') {
    c.fillStyle = 'rgba(79, 209, 224, 0.18)';
    c.fillRect(p.x, p.y, deco.w, deco.h);
    c.strokeStyle = '#4fd1e0';
    c.strokeRect(p.x, p.y, deco.w, deco.h);
    return;
  }
  const fill = deco.kind === 'pillar' ? '#123c4b' : deco.kind === 'wreck' ? '#26313c' : '#1e2c38';
  c.fillStyle = fill;
  c.strokeStyle = deco.kind === 'wreck' ? '#ff8c1a' : '#4fd1e0';
  c.lineWidth = 2;
  c.fillRect(p.x, p.y, deco.w, deco.h);
  c.strokeRect(p.x, p.y, deco.w, deco.h);
  if (deco.kind !== 'crate') {
    c.beginPath();
    c.moveTo(p.x + 8, p.y + deco.h - 8);
    c.lineTo(p.x + deco.w - 8, p.y + 8);
    c.stroke();
  }
}
