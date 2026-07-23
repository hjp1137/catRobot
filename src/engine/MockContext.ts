/**
 * MockContext —— Node 单元测试用运行时上下文
 *
 * 不依赖任何 wx/DOM；提供：
 *  - 可手动驱动的 now()（推进游戏帧）
 *  - 内存 Storage
 *  - 可注入 tap/move 的 Input
 *  - 空操作 Canvas（fillRect 等被记录但不绘制）
 *  - 可种子化的 random（用于可复现的敌人生成位置）
 */
import { IContext, ICanvas2D, IStorage, ISystemInfo } from './IContext';
import { Input } from './Input';

class MockCanvas implements ICanvas2D {
  private _fillStyle: any = '#000';
  get fillStyle(): any { return this._fillStyle; }
  set fillStyle(val: any) {
    this._fillStyle = val;
    this.calls.push('fillStyle:' + val);
  }
  public strokeStyle: any = '#000';
  public lineWidth = 1;
  public font = '14px sans-serif';
  public textAlign: CanvasTextAlign = 'left';
  public textBaseline: CanvasTextBaseline = 'alphabetic';
  public calls: string[] = [];
  clearRect() { this.calls.push('clear'); }
  fillRect() { this.calls.push('fillRect'); }
  strokeRect() { this.calls.push('strokeRect'); }
  fillText(t: string) { this.calls.push('text:' + t); }
  measureText(t: string) { return { width: t.length * 7 }; }
  beginPath() { this.calls.push('begin'); }
  arc() { this.calls.push('arc'); }
  closePath() { this.calls.push('closePath'); }
  fill() { this.calls.push('fill'); }
  stroke() { this.calls.push('stroke'); }
  moveTo() { this.calls.push('moveTo'); }
  lineTo() { this.calls.push('lineTo'); }
  save() { this.calls.push('save'); }
  restore() { this.calls.push('restore'); }
  clip() { this.calls.push('clip'); }
  scale() { this.calls.push('scale'); }
  translate() { this.calls.push('translate'); }
  rotate() { this.calls.push('rotate'); }
  globalAlpha = 1;
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  drawImage(image: any, ...args: any[]) {
    this.calls.push(`drawImage:${image?.src || 'unknown'}:${args.join(',')}`);
  }
}

export class MockImage {
  private _src = '';
  public onload: (() => void) | null = null;
  public onerror: ((err: any) => void) | null = null;

  get src(): string { return this._src; }
  set src(value: string) {
    this._src = value;
    // 异步触发模拟加载，如果路径中含有 fail 或 error 则报错
    setTimeout(() => {
      if (this._src.includes('fail') || this._src.includes('error')) {
        if (this.onerror) this.onerror(new Error('Mock load fail: ' + this._src));
      } else {
        if (this.onload) this.onload();
      }
    }, 1);
  }
}

class MockStorage implements IStorage {
  private map = new Map<string, string>();
  get(key: string): string | null { return this.map.has(key) ? this.map.get(key)! : null; }
  set(key: string, value: string): void { this.map.set(key, value); }
  remove(key: string): void { this.map.delete(key); }
  /** 导出快照，便于测试断言 */
  snapshot(): Record<string, string> {
    const out: Record<string, string> = {};
    this.map.forEach((v, k) => { out[k] = v; });
    return out;
  }
}

export class MockContext implements IContext {
  public readonly canvas = new MockCanvas();
  public readonly canvasWidth: number;
  public readonly canvasHeight: number;
  public readonly storage = new MockStorage();
  public readonly input = new Input();
  private clock = 0;
  private randSeed = 12345;

  constructor(width = 375, height = 667) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  now(): number { return this.clock; }
  /** 推进时钟（秒），用于驱动战斗循环 */
  advance(dt: number): void { this.clock += dt; }
  random(): number {
    // 简单 LCG，结果可复现
    this.randSeed = (this.randSeed * 1103515245 + 12345) & 0x7fffffff;
    return this.randSeed / 0x7fffffff;
  }
  log(..._args: unknown[]): void { /* 静默 */ }
  getSystemInfo(): ISystemInfo {
    return { windowWidth: this.canvasWidth, windowHeight: this.canvasHeight, pixelRatio: 2 };
  }
  createImage(): any {
    return new MockImage();
  }
}
