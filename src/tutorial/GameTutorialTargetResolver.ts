import { TUTORIAL_STATIC_TARGETS } from './TutorialCatalog';
import type { IContext } from '../engine/IContext';
import type { GameManager } from '../core/GameManager';
import type { TutorialBounds, TutorialTargetRegistry, TutorialTargetType } from './TutorialTargetRegistry';

export function registerGameTutorialTargets(ctx: IContext, game: GameManager,
  registry: TutorialTargetRegistry): () => void {
  const offs = TUTORIAL_STATIC_TARGETS.map(([type, id]) =>
    registry.register(type as TutorialTargetType, id, () => resolve(ctx, game, type, id)));
  return () => offs.forEach(off => off());
}

function resolve(ctx: IContext, game: any, type: string, id: string): TutorialBounds | null {
  if (type === 'canvas') return resolveCanvas(ctx, game, id);
  const buttons = game.menuUi?.buttons ?? [];
  if (id === 'home.campaign') return game.scene === 'menu' ? button(buttons.find((item: any) => item.id === 'battle')) : null;
  if (id === 'home.inventory' || id === 'home.equipment') {
    return game.scene === 'menu' ? button(buttons.find((item: any) => item.id === 'equip')) : null;
  }
  if (id === 'campaign.back') return game.scene === 'campaignMap' ? button(game.campaignMapUi?.backBtn) : null;
  if (id === 'equipment.inventory.first') {
    const area = game.equipmentPanelUi?.invAreas?.find((item: any) => !item.isEquipped);
    return game.scene === 'equipmentPanel' ? button(area) : null;
  }
  if (id === 'campaign.chapter.1') return game.scene === 'campaignMap' ? box(20, 28, ctx.canvasWidth - 40, 64) : null;
  if (id === 'campaign.stage.1-1' || id === 'campaign.new-node') {
    const cards = game.campaignMapUi?.cards ?? []; let card = cards[0];
    if (id === 'campaign.new-node') {
      const view = game.getCampaignChapterView?.(); const node = view?.nodes?.find((item: any) => item.state === 'NEWLY_UNLOCKED');
      card = cards.find((item: any) => item.nodeId === node?.id) ?? card;
    }
    return card ? box(card.x - card.r, card.y - card.r, card.r * 2, card.r * 2) : null;
  }
  if (id === 'stage.detail.start') return button(game.campaignStageDetailUi?.startBtn ?? game.stageIntroUi?.startBtn);
  if (id === 'stage.detail.objective') return detailRegion(ctx, game, 0.36, 0.18);
  if (id === 'stage.detail.power') return detailRegion(ctx, game, 0.20, 0.09);
  if (id === 'stage.detail.reward') return detailRegion(ctx, game, 0.58, 0.20);
  if (id === 'result.stars') return game.scene === 'result' ? box(ctx.canvasWidth * .2, 110, ctx.canvasWidth * .6, 70) : null;
  if (id === 'result.reward') return game.scene === 'result' ? box(ctx.canvasWidth * .12, 190, ctx.canvasWidth * .76, 190) : null;
  if (id === 'result.continue') {
    return game.scene === 'result' ? button(game.resultUi?.getTutorialContinueButton?.()) : null;
  }
  return null;
}

function resolveCanvas(ctx: IContext, game: any, id: string): TutorialBounds | null {
  if (game.scene !== 'battle') return null;
  if (id === 'battle.move-zone') return box(0, ctx.canvasHeight / 2, ctx.canvasWidth / 2, ctx.canvasHeight / 2);
  if (id === 'battle.attack') return box(ctx.canvasWidth * .62, ctx.canvasHeight * .66, ctx.canvasWidth * .35, ctx.canvasHeight * .3);
  if (id === 'battle.enemy') {
    const runtime = game.scene === 'explore' ? game.explore : game.battle;
    const enemy = runtime?.enemies?.find((item: any) => !item.dead); const r = enemy?.radius ?? 0;
    return enemy ? box(enemy.x - r, enemy.y - r, r * 2, r * 2) : null;
  }
  if (id === 'battle.wave') return box(ctx.canvasWidth * .25, 76, ctx.canvasWidth * .5, 70);
  if (id === 'battle.clear') return box(ctx.canvasWidth * .18, ctx.canvasHeight * .38, ctx.canvasWidth * .64, 100);
  return null;
}

function detailRegion(ctx: IContext, game: any, yRatio: number, hRatio: number): TutorialBounds | null {
  return ['campaignStageDetail', 'stageIntro'].includes(game.scene)
    ? box(28, ctx.canvasHeight * yRatio, ctx.canvasWidth - 56, ctx.canvasHeight * hRatio) : null;
}
function button(value: any): TutorialBounds | null { return value ? box(value.x, value.y, value.w, value.h) : null; }
function box(x: number, y: number, width: number, height: number): TutorialBounds { return { x, y, width, height }; }
