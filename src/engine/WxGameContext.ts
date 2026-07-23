/**
 * 微信小游戏运行时上下文 —— 生产环境实现
 *
 * 取用 wx 提供的 canvas / storage / systemInfo / 触摸事件。
 * 同时兼容浏览器调试（window 存在时降级到 DOM canvas + localStorage）。
 */
import { IContext, ICanvas2D, IStorage, IInputState, ISystemInfo } from './IContext';
import { Input } from './Input';

class WxStorage implements IStorage {
  get(key: string): string | null {
    const w = (globalThis as any).wx;
    try {
      const v = w ? w.getStorageSync(key) : localStorage.getItem(key);
      return v === '' || v === undefined || v === null ? null : String(v);
    } catch { return null; }
  }
  set(key: string, value: string): void {
    const w = (globalThis as any).wx;
    try { w ? w.setStorageSync(key, value) : localStorage.setItem(key, value); }
    catch (e) { console.warn('save fail', e); }
  }
  remove(key: string): void {
    const w = (globalThis as any).wx;
    try { w ? w.removeStorageSync(key) : localStorage.removeItem(key); }
    catch { /* ignore */ }
  }
}

class WxMockImage {
  private _src = '';
  public onload: (() => void) | null = null;
  public onerror: ((err: any) => void) | null = null;
  get src(): string { return this._src; }
  set src(value: string) {
    this._src = value;
    setTimeout(() => {
      if (this._src.includes('fail') || this._src.includes('error')) {
        if (this.onerror) this.onerror(new Error('Mock load fail: ' + this._src));
      } else {
        if (this.onload) this.onload();
      }
    }, 1);
  }
}

export class WxGameContext implements IContext {
  public readonly canvas: ICanvas2D;
  public readonly canvasWidth: number;
  public readonly canvasHeight: number;
  public readonly storage: IStorage;
  public readonly input: Input;

  constructor() {
    const w = (globalThis as any).wx;
    // 获取主 canvas
    const raw: any = w && w.createCanvas ? w.createCanvas() : this.fallbackCanvas();
    const ctx: ICanvas2D = raw.getContext('2d');
    this.canvas = ctx;

    const info = this.getSystemInfo();
    this.canvasWidth = info.windowWidth;
    this.canvasHeight = info.windowHeight;
    // 微信小游戏需要按物理像素设置 canvas 尺寸以避免模糊
    raw.width = info.windowWidth * info.pixelRatio;
    raw.height = info.windowHeight * info.pixelRatio;
    ctx.scale(info.pixelRatio, info.pixelRatio);
    // raw 上面已读过 getContext，避免「可能为 null」告警

    this.storage = new WxStorage();
    this.input = new Input();
    this.input.attachTouch();
    this.input.attachKeyboard(); // 浏览器调试时生效；wx 下自动 no-op
  }

  public now(): number {
    return Date.now() / 1000;
  }

  public random(): number {
    return Math.random();
  }

  public log(...args: unknown[]): void {
    console.log(...args);
  }

  public getSystemInfo(): ISystemInfo {
    const w = (globalThis as any).wx;
    if (w && w.getSystemInfoSync) {
      const i = w.getSystemInfoSync();
      let menuButton: ISystemInfo['menuButton'] | undefined;
      try {
        const m = w.getMenuButtonBoundingClientRect?.();
        if (m && typeof m.bottom === 'number') {
          menuButton = {
            top: m.top ?? 0,
            bottom: m.bottom,
            height: m.height ?? 0,
            right: m.right ?? 0,
            width: m.width ?? 0,
          };
        }
      } catch { /* older runtimes may not expose capsule metrics */ }
      return {
        windowWidth: i.windowWidth ?? i.screenWidth ?? 375,
        windowHeight: i.windowHeight ?? i.screenHeight ?? 667,
        pixelRatio: i.pixelRatio ?? 2,
        statusBarHeight: i.statusBarHeight,
        platform: i.platform,
        menuButton,
      };
    }
    // 浏览器调试降级
    const win = (globalThis as any).window;
    return {
      windowWidth: win?.innerWidth ?? 375,
      windowHeight: win?.innerHeight ?? 667,
      pixelRatio: win?.devicePixelRatio ?? 2,
    };
  }

  public createImage(): any {
    const w = (globalThis as any).wx;
    if (w && w.createImage) {
      return w.createImage();
    }
    const win = (globalThis as any).window;
    if (win && win.Image) {
      return new win.Image();
    }
    return new WxMockImage();
  }

  private fallbackCanvas(): HTMLCanvasElement {
    const win = (globalThis as any).window;
    if (win && win.document) {
      const existing = win.document.getElementById('gameCanvas');
      if (existing instanceof HTMLCanvasElement) return existing;
      const c: HTMLCanvasElement = win.document.createElement('canvas');
      c.id = 'gameCanvas';
      win.document.body.appendChild(c);
      return c;
    }
    throw new Error('No canvas available (neither wx nor DOM)');
  }
}
