import type { ExploreScene } from './ExploreScene';
import { worldToScreen } from './WorldTransform';

export interface ExploreGuideTarget {
  type: 'enemy' | 'resource' | 'chest' | 'complete';
  id: string;
  worldX: number;
  worldY: number;
  label: string;
  distance: number;
  visibleOnScreen: boolean;
}

export function getExploreGuideTarget(scene: ExploreScene): ExploreGuideTarget {
  const p = scene.player;
  const obj = scene.objective;

  // 1. 击败未完成
  if (!obj.enemyKillGoalCompleted) {
    let closestEnemy: any = null;
    let minD = Infinity;
    for (const e of scene.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < minD) { minD = d; closestEnemy = e; }
    }
    if (closestEnemy) {
      const scr = worldToScreen(scene.camera, closestEnemy);
      const vis = scr.x >= 0 && scr.x <= scene.camera.viewportWidth &&
                  scr.y >= 0 && scr.y <= scene.camera.viewportHeight;
      return {
        type: 'enemy',
        id: closestEnemy.id || 'unknown_enemy',
        worldX: closestEnemy.x,
        worldY: closestEnemy.y,
        label: '清理敌人',
        distance: Math.round(minD),
        visibleOnScreen: vis,
      };
    }
    // 没有活着的敌人，找最近活跃的 spawnPoint
    let closestSp: any = null;
    for (const sp of scene.spawnPoints) {
      if (!sp.active) continue;
      const d = Math.hypot(sp.x - p.x, sp.y - p.y);
      if (d < minD) { minD = d; closestSp = sp; }
    }
    if (closestSp) {
      const scr = worldToScreen(scene.camera, closestSp);
      const vis = scr.x >= 0 && scr.x <= scene.camera.viewportWidth &&
                  scr.y >= 0 && scr.y <= scene.camera.viewportHeight;
      return {
        type: 'enemy',
        id: closestSp.id,
        worldX: closestSp.x,
        worldY: closestSp.y,
        label: '清理敌人',
        distance: Math.round(minD),
        visibleOnScreen: vis,
      };
    }
  }

  // 2. 击败完成但资源未完成
  if (!obj.resourceGoalCompleted) {
    let closestNode: any = null;
    let minD = Infinity;
    for (const node of scene.resourceNodes) {
      if (node.collected) continue;
      const d = Math.hypot(node.x - p.x, node.y - p.y);
      if (d < minD) { minD = d; closestNode = node; }
    }
    if (closestNode) {
      const scr = worldToScreen(scene.camera, closestNode);
      const vis = scr.x >= 0 && scr.x <= scene.camera.viewportWidth &&
                  scr.y >= 0 && scr.y <= scene.camera.viewportHeight;
      return {
        type: 'resource',
        id: closestNode.id,
        worldX: closestNode.x,
        worldY: closestNode.y,
        label: '寻找资源',
        distance: Math.round(minD),
        visibleOnScreen: vis,
      };
    }
  }

  // 3. 资源完成但宝箱未完成
  if (!obj.chestGoalCompleted) {
    let closestChest: any = null;
    let minD = Infinity;
    for (const chest of scene.chests) {
      if (chest.opened) continue;
      const d = Math.hypot(chest.x - p.x, chest.y - p.y);
      if (d < minD) { minD = d; closestChest = chest; }
    }
    if (closestChest) {
      const scr = worldToScreen(scene.camera, closestChest);
      const vis = scr.x >= 0 && scr.x <= scene.camera.viewportWidth &&
                  scr.y >= 0 && scr.y <= scene.camera.viewportHeight;
      return {
        type: 'chest',
        id: closestChest.id,
        worldX: closestChest.x,
        worldY: closestChest.y,
        label: '打开宝箱',
        distance: Math.round(minD),
        visibleOnScreen: vis,
      };
    }
  }

  // 兜底返回训练完成
  return {
    type: 'complete',
    id: '',
    worldX: p.x,
    worldY: p.y,
    label: '训练完成',
    distance: 0,
    visibleOnScreen: true,
  };
}
