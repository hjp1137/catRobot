/**
 * IContext —— 平台抽象层
 * ------------------------------------------------------------------
 * 目的：把所有「与运行平台耦合」的能力（画布、存档、时间、输入、随机数、
 * 日志）抽象为接口，让游戏逻辑层只依赖接口而不直接依赖 wx / DOM / Node。
 *
 * - WxGameContext：微信小游戏运行时实现（生产用）
 * - BrowserContext：浏览器调试实现（可选）
 * - MockContext：单元测试实现（Node，纯逻辑验证）
 *
 * 这样 BattleManager / PlayerMecha 等纯逻辑类可在 Node 下用 Mock 注入，
 * 完成「禁止让用户充当测试员」所要求的本地自验证闭环。
 */

/** 渐变对象（对应 CanvasGradient 的最小子集） */
export interface IGradient {
  addColorStop(offset: number, color: string): void;
}

/** 画布 2D 上下文的最小子集，足够本 MVP 渲染 */
export interface ICanvas2D {
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  fillText(text: string, x: number, y: number): void;
  measureText(text: string): { width: number };
  beginPath(): void;
  arc(x: number, y: number, r: number, start: number, end: number): void;
  closePath(): void;
  fill(): void;
  stroke(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  save(): void;
  restore(): void;
  clip(): void;
  /** 渐变：任务2 视觉升级所需。Mock/Fake 实现返回记录 stops 的假对象。 */
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): IGradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): IGradient;
  /** 虚线设置（可选，Mock 可能不实现）。BackgroundRenderer 用可选链调用。 */
  setLineDash?(segments: number[]): void;
  /** 任务7：椭圆（甲虫绘制用；真实 canvas 支持） */
  ellipse?(x: number, y: number, rx: number, ry: number, rotation: number, start: number, end: number): void;
  scale(x: number, y: number): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  drawImage(image: any, dx: number, dy: number): void;
  drawImage(image: any, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: any, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
  globalAlpha: number;
  fillStyle: string | CanvasGradient;
  strokeStyle: string | CanvasGradient;
  lineWidth: number;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
}

/** 输入状态：归一化方向 + 触摸坐标 */
export interface IInputState {
  /** 归一化移动向量（键盘或虚拟摇杆合成），范围 -1..1 */
  moveX: number;
  moveY: number;
  /** 最近一次 tap（点击）的屏幕坐标，null 表示无新 tap */
  tapX: number | null;
  tapY: number | null;
  /** 消费 tap（处理完后置 null） */
  consumeTap(): void;
}

/** 持久化存储接口 */
export interface IStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** 系统信息：用于布局与适配 */
export interface ISystemInfo {
  windowWidth: number;
  windowHeight: number;
  pixelRatio: number;
  statusBarHeight?: number;
  platform?: string;
  menuButton?: {
    top: number;
    bottom: number;
    height: number;
    right: number;
    width: number;
  };
}

/** 平台运行时上下文 */
export interface IContext {
  canvas: ICanvas2D;
  canvasWidth: number;
  canvasHeight: number;
  storage: IStorage;
  input: IInputState;
  /** 单调时钟（秒） */
  now(): number;
  /** [0,1) 伪随机 */
  random(): number;
  log(...args: unknown[]): void;
  getSystemInfo(): ISystemInfo;
  /** 任务12：创建图片对象（微信小游戏与浏览器兼容） */
  createImage(): any;
}
