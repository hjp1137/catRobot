import type { IContext } from '../engine/IContext';
import type { GameManager, Scene } from '../core/GameManager';
import { EVT } from '../core/EventManager';
import type { TutorialDirector } from './TutorialDirector';
import type { TutorialInputLimiter } from './TutorialInputLimiter';

const SCENE_EVENTS: Partial<Record<Scene, string[]>> = {
  menu: ['page.home', 'app.ready', 'app-first-launch'], chapterSelect: ['page.campaign', 'campaign-page-opened'],
  campaignMap: ['page.campaign', 'campaign-page-opened', 'chapter-map-opened'],
  campaignStageDetail: ['page.stage-detail', 'stage-detail-opened'], stageIntro: ['page.stage-detail', 'stage-detail-opened'],
  battle: ['battle.ready'], explore: ['battle.ready'], result: ['page.result', 'settlement-opened'],
  equipmentPanel: ['page.inventory', 'equipment-page-opened'],
};

export class TutorialRuntimeController {
  private offScene: () => void;
  private skipConfirmation = false;
  constructor(private ctx: IContext, private game: GameManager, public readonly director: TutorialDirector,
    private limiter: TutorialInputLimiter, private cleanup?: () => void) {
    this.offScene = game.events.on(EVT.SCENE_CHANGED, scene => this.onScene(scene as Scene));
  }

  start(): void { this.director.start(); this.onScene(this.game.scene); }
  restoreStep(): void { /* scene.changed listener owns runtime recovery; legacy uses its own manager */ }
  update(_dt: number): void { this.director.update(); }
  isActive(): boolean { return !['IDLE', 'COMPLETED', 'SKIPPED', 'DISPOSED'].includes(this.director.debug().state); }
  getStep(): string | undefined { return this.director.debug().stepId; }
  getTargetArea(): LegacyTargetArea | null {
    const bounds = this.director.debug().target?.bounds;
    return bounds ? { type: 'rect', x: bounds.x, y: bounds.y, w: bounds.width, h: bounds.height } : null;
  }

  handleInput(): boolean {
    const x = this.ctx.input.tapX, y = this.ctx.input.tapY;
    const debug = this.director.debug();
    if (x != null && y != null && debug.skippable && inside(x, y, this.skipBounds())) {
      this.ctx.input.consumeTap();
      if (this.skipConfirmation) { this.director.skip(true); this.skipConfirmation = false; }
      else this.skipConfirmation = true;
      return true;
    }
    if (!this.limiter.isRestricted()) return false;
    if (x == null || y == null) return false;
    const target = debug.target;
    if (!target || !inside(x, y, target.bounds)) { this.ctx.input.consumeTap(); return true; }
    this.game.events.emit(debug.completionType, { targetId: target.id, x, y });
    this.onScene(this.game.scene);
    if (debug.completionType === 'campaign.node-unlocked') { this.ctx.input.consumeTap(); return true; }
    return false;
  }

  render(): void {
    const debug = this.director.debug(), target = debug.target, c = this.ctx.canvas, w = this.ctx.canvasWidth, h = this.ctx.canvasHeight;
    c.save();
    if (target) {
      const b = target.bounds; c.fillStyle = 'rgba(0,0,0,.62)';
      c.fillRect(0, 0, w, b.y); c.fillRect(0, b.y, b.x, b.height);
      c.fillRect(b.x + b.width, b.y, w - b.x - b.width, b.height); c.fillRect(0, b.y + b.height, w, h - b.y - b.height);
      c.strokeStyle = '#58e4ff'; c.lineWidth = 3; c.strokeRect(b.x - 4, b.y - 4, b.width + 8, b.height + 8);
      c.fillStyle = '#ffffff'; c.font = 'bold 18px sans-serif'; c.fillText(debug.title ?? '', 20, Math.min(h - 64, b.y + b.height + 36));
      c.font = '14px sans-serif'; c.fillText(debug.body ?? '', 20, Math.min(h - 38, b.y + b.height + 60));
    }
    if (debug.skippable) { const b = this.skipBounds(); c.fillStyle = '#153445'; c.fillRect(b.x, b.y, b.width, b.height);
      c.fillStyle = '#ffffff'; c.font = '13px sans-serif'; c.fillText(this.skipConfirmation ? '确认跳过' : '跳过教学', b.x + 8, b.y + 21); }
    c.restore();
  }

  pause(): void { this.director.pause(); }
  resume(): void { this.director.resume(); }
  dispose(): void { this.offScene(); this.cleanup?.(); this.director.dispose(); this.limiter.dispose(); }

  private onScene(scene: Scene): void {
    this.director.refreshTarget();
    for (const event of SCENE_EVENTS[scene] ?? []) this.game.events.emit(event, { scene });
  }
  private skipBounds(): any { return { x: this.ctx.canvasWidth - 96, y: 16, width: 80, height: 34 }; }
}

type LegacyTargetArea = { type: 'rect'; x: number; y: number; w: number; h: number };

function inside(x: number, y: number, b: any): boolean {
  return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
}
