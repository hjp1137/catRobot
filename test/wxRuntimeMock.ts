/**
 * 微信小游戏运行时模拟器（Node 集成测试用）
 * ------------------------------------------------------------------
 * 把 wx 全局、canvas、touch、requestAnimationFrame、storage 全部 mock，
 * 让 src/main.ts 的 bootstrap() 真实跑起来。然后通过 dispatch* 注入
 * 触摸事件、advance() 推进帧，驱动一整局游戏，用于集成冒烟测试。
 *
 * 这覆盖了「真实 bootstrap 流程 + 微信 API 兼容性 + 主循环 + 触摸链路」，
 * 是本机无微信开发者工具 GUI 时的最强替代验证手段。
 */

/** 逻辑像素窗口（iPhone 12/13 模拟器基准） */
export const MOCK_WINDOW_W = 375;
export const MOCK_WINDOW_H = 812;
export const MOCK_PIXEL_RATIO = 3;

/** 累计 canvas 2D 调用，便于断言「确实在画」 */
export class FakeCanvas2D {
  public fillStyle: any = '#000';
  public strokeStyle: any = '#000';
  public lineWidth = 1;
  public font = '14px sans-serif';
  public textAlign: CanvasTextAlign = 'left';
  public textBaseline: CanvasTextBaseline = 'alphabetic';
  public globalAlpha = 1;
  public width = 0;
  public height = 0;

  public calls = { clear: 0, fillRect: 0, strokeRect: 0, fillText: 0, arc: 0, fill: 0, stroke: 0, drawImage: 0 };
  public texts: string[] = [];

  clearRect() { this.calls.clear++; }
  fillRect() { this.calls.fillRect++; }
  strokeRect() { this.calls.strokeRect++; }
  fillText(t: string) { this.calls.fillText++; this.texts.push(t); }
  measureText(t: string) { return { width: t.length * 8 }; }
  beginPath() {}
  arc() { this.calls.arc++; }
  closePath() {}
  fill() { this.calls.fill++; }
  stroke() { this.calls.stroke++; }
  moveTo() {}
  lineTo() {}
  save() {}
  restore() {}
  clip() {}
  scale() {}
  translate() {}
  rotate() {}
  drawImage() { this.calls.drawImage++; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  getContext() { return this; }
}

/** 一个 fake wx canvas：getContext 返回上面的 FakeCanvas2D，并有 RAF */
export class FakeCanvas {
  public width = 0;
  public height = 0;
  private ctx: FakeCanvas2D;
  private rafCallbacks: Array<(ts: number) => void> = [];

  constructor() {
    this.ctx = new FakeCanvas2D();
    (this.ctx as any).canvas = this;
  }

  getContext(_type: string): FakeCanvas2D { return this.ctx; }

  /** wx canvas 自带 requestAnimationFrame */
  requestAnimationFrame(cb: (ts: number) => void): number {
    this.rafCallbacks.push(cb);
    return this.rafCallbacks.length;
  }

  /** 由测试驱动：触发一帧所有注册的 RAF 回调 */
  pumpRaf(ts: number): void {
    const cbs = this.rafCallbacks;
    this.rafCallbacks = [];
    for (const cb of cbs) cb(ts);
  }

  get rafPendingCount() { return this.rafCallbacks.length; }
  getCallStats() { return this.ctx.calls; }
  getDrawnTexts() { return this.ctx.texts; }
}

/** 模拟 wx storage */
class FakeStorage {
  private map = new Map<string, any>();
  getStorageSync(key: string) { return this.map.has(key) ? this.map.get(key) : ''; }
  setStorageSync(key: string, v: any) { this.map.set(key, v); }
  removeStorageSync(key: string) { this.map.delete(key); }
  clearStorageSync() { this.map.clear(); }
  dump() { return new Map(this.map); }
}

export interface TouchPoint { identifier: number; clientX: number; clientY: number; }

/**
 * 微信运行时环境。install() 把 wx / canvas / RAF 等挂到 globalThis，
 * bootstrap 才能正常跑。uninstall() 清理，避免污染其他测试。
 */
export class WxRuntimeMock {
  public readonly canvas: FakeCanvas;
  public readonly storage = new FakeStorage();
  public windowWidth = MOCK_WINDOW_W;
  public windowHeight = MOCK_WINDOW_H;
  public pixelRatio = MOCK_PIXEL_RATIO;

  private touchStartHandlers: Array<(e: any) => void> = [];
  private touchMoveHandlers: Array<(e: any) => void> = [];
  private touchEndHandlers: Array<(e: any) => void> = [];
  private globalRafCallbacks: Array<(ts: number) => void> = [];
  private installed = false;
  private clockMs = 0;
  private savedGlobals: Record<string, any> = {};
  private realDateNow: typeof Date.now = Date.now;

  constructor() { this.canvas = new FakeCanvas(); }

  install(): void {
    if (this.installed) throw new Error('already installed');
    this.installed = true;
    const self = this;
    const g = globalThis as any;

    const wxMock = {
      getSystemInfoSync: () => ({
        windowWidth: self.windowWidth,
        windowHeight: self.windowHeight,
        pixelRatio: self.pixelRatio,
        screenWidth: self.windowWidth,
        screenHeight: self.windowHeight,
        platform: 'devtools',
      }),
      getStorageSync: (k: string) => self.storage.getStorageSync(k),
      setStorageSync: (k: string, v: any) => self.storage.setStorageSync(k, v),
      removeStorageSync: (k: string) => self.storage.removeStorageSync(k),
      clearStorageSync: () => self.storage.clearStorageSync(),
      createCanvas: () => self.canvas,
      onTouchStart: (cb: (e: any) => void) => { self.touchStartHandlers.push(cb); },
      onTouchMove: (cb: (e: any) => void) => { self.touchMoveHandlers.push(cb); },
      onTouchEnd: (cb: (e: any) => void) => { self.touchEndHandlers.push(cb); },
      onTouchCancel: (cb: (e: any) => void) => { self.touchEndHandlers.push(cb); },
      getMenuButtonBoundingClientRect: () => ({ top: 0, right: 0, width: 0, height: 0 }),
      vibrateShort: () => {},
      canvas: self.canvas,
      createInnerAudioContext: () => ({
        src: '',
        loop: false,
        play: () => {},
        stop: () => {},
        destroy: () => {},
      }),
    };

    // 备份并覆盖全局
    for (const k of ['wx', 'requestAnimationFrame', 'cancelAnimationFrame', 'canvas']) {
      this.savedGlobals[k] = g[k];
    }
    // 关键：patch Date.now 让生产的 WxGameContext.now()（基于 Date.now）
    // 能被模拟器驱动。否则 Node 执行太快，每帧 dt≈0，战斗逻辑不动。
    this.savedGlobals['__Date_now'] = (Date as any).now;
    (Date as any).now = () => this.clockMs;
    g.wx = wxMock;
    g.canvas = self.canvas;
    // 全局 RAF：pump 时统一触发
    g.requestAnimationFrame = (cb: (ts: number) => void) => {
      self.globalRafCallbacks.push(cb);
      return self.globalRafCallbacks.length;
    };
    g.cancelAnimationFrame = () => {};
  }

  uninstall(): void {
    if (!this.installed) return;
    const g = globalThis as any;
    for (const k of Object.keys(this.savedGlobals)) {
      if (k === '__Date_now') {
        (Date as any).now = this.savedGlobals[k];
      } else if (this.savedGlobals[k] === undefined) delete g[k];
      else g[k] = this.savedGlobals[k];
    }
    this.savedGlobals = {};
    this.touchStartHandlers = [];
    this.touchMoveHandlers = [];
    this.touchEndHandlers = [];
    this.globalRafCallbacks = [];
    this.installed = false;
  }

  /** 推进一个 RAF 帧：先推进时钟，再触发所有 RAF 回调（含 canvas 和全局） */
  advance(dtMs: number): void {
    this.clockMs += dtMs;
    const cbs = this.globalRafCallbacks;
    this.globalRafCallbacks = [];
    for (const cb of cbs) cb(this.clockMs);
    this.canvas.pumpRaf(this.clockMs);
  }

  /** 注入一次触摸开始（坐标用逻辑像素） */
  dispatchTouchStart(x: number, y: number, identifier = 0): void {
    const e = { touches: [{ identifier, clientX: x, clientY: y }] as TouchPoint[] };
    for (const cb of this.touchStartHandlers) cb(e);
  }
  dispatchTouchMove(x: number, y: number, identifier = 0): void {
    const e = { touches: [{ identifier, clientX: x, clientY: y }] as TouchPoint[] };
    for (const cb of this.touchMoveHandlers) cb(e);
  }
  dispatchTouchEnd(identifier = 0): void {
    const e = { touches: [], changedTouches: [{ identifier }] };
    for (const cb of this.touchEndHandlers) cb(e);
  }

  /** 直接清存档（模拟用户清缓存） */
  clearStorage(): void { this.storage.clearStorageSync(); }
  getStorageMap() { return this.storage.dump(); }

  get clock() { return this.clockMs; }
  get rafPending() { return this.globalRafCallbacks.length; }
}
