import type { ICanvas2D } from '../engine/IContext';
import type { ExploreScene } from './ExploreScene';
import { BATTLE_ASSETS, BATTLE_VISUAL_TUNING, getEnemyVisualScale } from '../config/BattleAssets';
import { Theme } from '../render/Theme';
import { circle, fillRoundRect, healthBar, text } from '../render/DrawUtils';
import { drawAttackRange } from '../render/BackgroundRenderer';
import { drawEnemy } from '../render/Chapter2EnemyRenderer';
import { drawMecha } from '../render/MechaRenderer';
import { drawMeowCannonEffect, drawShieldEffect } from '../render/SkillRenderer';
import { worldToScreen } from './WorldTransform';
import { drawExploreTrainingMap } from './ExploreMapRenderer';
import { resolveAnimatedArtKey, resolveDirectionalAnimationState } from '../animation/AnimationRuntime';
import type { ArtResourceKey } from '../assets/ArtResourceKeys';
import {
  getExploreEnemyVisualRadius,
  getExplorePlayerVisualRadius,
  resolveExploreActionArtKey,
  resolveExploreHeroArtKey,
} from './ExploreMotionVisuals';

export function drawExploreScene(c: ICanvas2D, scene: ExploreScene, time: number): void {
  drawExploreTrainingMap(c, scene.camera, time, scene.backgroundTheme, scene.stageLayers);
  drawExploreContentMarkers(c, scene, time);
  const playerScreen = worldToScreen(scene.camera, scene.player);
  drawAttackRange(c, playerScreen.x, playerScreen.y, scene.player.attackRange, time);

  for (const e of scene.enemies) {
    const p = worldToScreen(scene.camera, e);
    const facingTarget = e.exploreState === 'patrol'
      ? { x: e.patrolTargetX, y: e.patrolTargetY }
      : scene.player;
    const dx = facingTarget.x - e.x;
    const dy = facingTarget.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const configuredRadius = e.radius * (e.visual?.displayScale ?? getEnemyVisualScale(e.isBoss, e.variant !== 'normal'));
    const visualRadius = getExploreEnemyVisualRadius(configuredRadius);
    const directionalState = resolveDirectionalAnimationState(
      e.animationState, dx, dy, e.visual?.animationClipKeys,
    );
    const animatedArtKey = resolveAnimatedArtKey({
      player: e.animationPlayer,
      targetType: 'enemy',
      state: directionalState,
      bindings: e.visual?.animationClipKeys,
      fallbackArtKey: artKeyForState(e.visual, e.animationState),
    });
    const enemyArtKey = resolveExploreActionArtKey(e.animationState, e.visual?.moveArtKey, animatedArtKey);
    drawEnemy(c, {
      cx: p.x, cy: p.y, radius: visualRadius,
      hpRatio: e.hpRatio, hitFlash: e.hitFlash,
      dirX: dx / d, dirY: dy / d, showBar: false,
      variant: e.variant, artKey: enemyArtKey,
      shadowScale: e.visual?.shadowScale,
    });
    const guideTarget = scene.getGuideTarget();
    const isTarget = guideTarget && guideTarget.type === 'enemy' && Math.hypot(e.x - guideTarget.worldX, e.y - guideTarget.worldY) < 1;
    if (isTarget) {
      const tipY = p.y - visualRadius - 12 + Math.sin(time * 8) * 3;
      c.save();
      c.fillStyle = Theme.color.redBright;
      c.beginPath();
      c.moveTo(p.x, tipY);
      c.lineTo(p.x - 8, tipY - 12);
      c.lineTo(p.x + 8, tipY - 12);
      c.closePath();
      c.fill();
      c.restore();
      text(c, '清理敌人', p.x, tipY - 16, { color: Theme.color.redBright, align: 'center', font: Theme.font.small });
    }
  }

  drawExploreProjectiles(c, scene);
  scene.feedback.render(c, point => worldToScreen(scene.camera, point));
  drawExplorePlayer(c, scene, playerScreen.x, playerScreen.y, time);
}

function drawExploreContentMarkers(c: ICanvas2D, scene: ExploreScene, time: number): void {
  c.save();
  c.lineWidth = 2;
  const guideTarget = scene.getGuideTarget();
  for (const sp of scene.spawnPoints) {
    const p = worldToScreen(scene.camera, sp);
    c.globalAlpha = 0.18;
    c.strokeStyle = Theme.color.redBright;
    c.beginPath(); c.arc(p.x, p.y, sp.radius, 0, Math.PI * 2); c.stroke();
  }
  c.globalAlpha = 1;
  for (const node of scene.resourceNodes) {
    if (node.collected) continue;
    const p = worldToScreen(scene.camera, node);
    const color = node.type === 'energy' ? Theme.color.cyan : node.type === 'coin' ? Theme.color.gold : Theme.color.green;
    circle(c, p.x, p.y, 9 + Math.sin(time * 5) * 1.5, color);
    c.strokeStyle = color;
    c.beginPath(); c.arc(p.x, p.y, 18, 0, Math.PI * 2); c.stroke();
    text(c, resourceMark(node.type), p.x, p.y - 30, { color, align: 'center', font: Theme.font.small });
    const isTarget = guideTarget && guideTarget.type === 'resource' && guideTarget.id === node.id;
    if (isTarget) {
      c.save();
      c.strokeStyle = color;
      c.lineWidth = 3;
      c.beginPath(); c.arc(p.x, p.y, 24 + Math.sin(time * 8) * 4, 0, Math.PI * 2); c.stroke();
      c.restore();
      text(c, '目标资源', p.x, p.y - 48, { color: Theme.color.white, align: 'center', font: Theme.font.small });
    }
    if (isNear(scene.player, node, scene.player.radius + 54)) {
      drawInteractHint(c, p.x, p.y - (isTarget ? 66 : 48), '拾取');
    }
  }
  for (const chest of scene.chests) {
    const p = worldToScreen(scene.camera, chest);
    c.fillStyle = chest.opened ? 'rgba(80,90,96,0.78)' : Theme.color.gold;
    c.fillRect(p.x - 14, p.y - 10, 28, 20);
    c.strokeStyle = chest.opened ? Theme.color.gray : Theme.color.white;
    c.strokeRect(p.x - 14, p.y - 10, 28, 20);
    c.beginPath(); c.moveTo(p.x - 12, p.y - 2); c.lineTo(p.x + 12, p.y - 2); c.stroke();
    text(c, chest.opened ? '开' : chest.rewardType === 'heal' ? '补' : '箱', p.x, p.y - 4, {
      color: chest.opened ? Theme.color.gray : Theme.color.white,
      align: 'center',
      font: Theme.font.small,
    });
    const isTarget = guideTarget && guideTarget.type === 'chest' && guideTarget.id === chest.id;
    if (isTarget && !chest.opened) {
      c.save();
      c.strokeStyle = Theme.color.cyan;
      c.lineWidth = 3 + Math.sin(time * 8) * 1.5;
      c.strokeRect(p.x - 18, p.y - 14, 36, 28);
      c.restore();
      text(c, '补给箱', p.x, p.y - 24, { color: Theme.color.cyan, align: 'center', font: Theme.font.small });
    }
    if (!chest.opened && isNear(scene.player, chest, scene.player.radius + 58)) {
      drawInteractHint(c, p.x, p.y - (isTarget ? 42 : 36), chest.rewardType === 'heal' ? '补给' : '打开');
    }
  }
  c.restore();
}

function isNear(a: { x: number; y: number }, b: { x: number; y: number }, distance: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= distance;
}

function resourceMark(type: string): string {
  if (type === 'energy') return '能';
  if (type === 'scrap') return '料';
  if (type === 'chip') return '芯';
  return '金';
}

function drawInteractHint(c: ICanvas2D, x: number, y: number, label: string): void {
  const w = label.length * 14 + 18;
  fillRoundRect(c, x - w / 2, y - 12, w, 22, 6, 'rgba(6, 12, 22, 0.82)');
  c.strokeStyle = Theme.color.white;
  c.strokeRect(x - w / 2, y - 12, w, 22);
  text(c, label, x, y - 7, { color: Theme.color.white, align: 'center', font: Theme.font.small });
}

function drawExploreProjectiles(c: ICanvas2D, scene: ExploreScene): void {
  c.save();
  for (const p of scene.player.getActiveProjectiles()) {
    const head = worldToScreen(scene.camera, p);
    const from = worldToScreen(scene.camera, { x: p.fromX, y: p.fromY });
    const dx = head.x - from.x;
    const dy = head.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const tail = Math.min(22, len);
    const tx = head.x - dx / len * tail;
    const ty = head.y - dy / len * tail;
    c.strokeStyle = Theme.color.cyan;
    c.lineWidth = BATTLE_VISUAL_TUNING.projectileVisualWidth;
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(head.x, head.y); c.stroke();
    circle(c, head.x, head.y, BATTLE_VISUAL_TUNING.projectileCoreRadius, Theme.color.white);
  }
  c.restore();
}

function drawExplorePlayer(c: ICanvas2D, scene: ExploreScene, x: number, y: number, time: number): void {
  const player = scene.player;
  const actionState = player.isMoving ? 'move' : player.animationState;
  const configuredRadius = player.radius * BATTLE_ASSETS.player.idle.scale * (scene.heroVisualTemplate?.visual.displayScale ?? 1);
  const visualRadius = getExplorePlayerVisualRadius(configuredRadius);
  const directionalState = resolveDirectionalAnimationState(
    actionState, player.moveDirectionX, player.moveDirectionY,
    scene.heroVisualTemplate?.visual.animationClipKeys,
  );
  const animatedArtKey = resolveAnimatedArtKey({
    player: player.animationPlayer,
    targetType: 'hero',
    state: directionalState,
    bindings: scene.heroVisualTemplate?.visual.animationClipKeys,
    fallbackArtKey: artKeyForState(scene.heroVisualTemplate?.visual, actionState),
  });
  const playerArtKey = resolveExploreHeroArtKey(
    actionState,
    player.isMoving,
    time,
    scene.heroVisualTemplate?.visual.idleArtKey,
    animatedArtKey,
  );
  drawMecha(c, {
    cx: x, cy: y, radius: visualRadius,
    hitFlash: player.hitFlash, attackFlash: player.attackFlash,
    facing: player.facing, battleFocus: true, time,
    artKey: playerArtKey,
    shadowScale: scene.heroVisualTemplate?.visual.shadowScale,
  });
  healthBar(c, x - 30, y - visualRadius - BATTLE_VISUAL_TUNING.playerHpBarOffset, 60, 6,
    player.hpRatio, { showText: `${Math.ceil(player.hp)}` });

  const shieldState = player.skillState.get('heavy_shield');
  if (shieldState?.isActive) {
    drawShieldEffect(c, x, y, visualRadius, true, shieldState.activeRemaining, player.shieldHitFlash, time);
  }
  if (player.meowCannonFlash > 0) {
    const lvl = player.skillState.getLevel('meow_cannon');
    drawMeowCannonEffect(c, x, y, player.facingAngle, player.meowCannonFlash, lvl);
  }
}

function artKeyForState(visual: any, state: string): ArtResourceKey | undefined {
  const map: Record<string, string> = {
    idle: 'idleArtKey',
    move: 'moveArtKey',
    attack: 'attackArtKey',
    hit: 'hitArtKey',
    death: 'deathArtKey',
  };
  return (visual?.[map[state] ?? 'idleArtKey'] ?? visual?.idleArtKey) as ArtResourceKey | undefined;
}
