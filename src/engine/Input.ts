/**
 * 输入管理 —— 同时支持：
 *  - 键盘 WASD / 方向键（PC 浏览器调试）
 *  - 触摸（微信小游戏 + 浏览器）：左半屏拖动 = 虚拟摇杆，点击按钮 = tap
 *
 * 对外暴露一个 IInputState。逻辑层只读 moveX/moveY/tap。
 */
import { IInputState } from './IContext';

export class Input implements IInputState {
  public moveX = 0;
  public moveY = 0;
  public tapX: number | null = null;
  public tapY: number | null = null;

  // 虚拟摇杆状态
  private touchId: number | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly deadZone = 8; // 像素死区，避免抖动
  private readonly maxRadius = 60; // 摇杆最大半径

  // 键盘状态（仅 PC 调试用）
  private keys: Record<string, boolean> = {};
  private keyboardDocument: any;
  private readonly handleKeyDown = (event: any) => this.handleKeyboard(event, true);
  private readonly handleKeyUp = (event: any) => this.handleKeyboard(event, false);

  /**
   * 绑定到 wx 全局触摸事件（生产）。若 wx 不存在则跳过，
   * 由 attachKeyboard / 模拟方法驱动（测试环境）。
   */
  public attachTouch(): void {
    const w = (globalThis as any).wx;
    if (!w || !w.onTouchStart) return;
    w.onTouchStart((e: any) => this.onTouchStart(e));
    w.onTouchMove((e: any) => this.onTouchMove(e));
    w.onTouchEnd((e: any) => this.onTouchEnd(e));
    w.onTouchCancel((e: any) => this.onTouchEnd(e));
  }

  /** PC 调试：监听 DOM 键盘事件 */
  public attachKeyboard(): void {
    const w = (globalThis as any).window;
    if (!w?.document || this.keyboardDocument) return;
    this.keyboardDocument = w.document;
    this.keyboardDocument.addEventListener('keydown', this.handleKeyDown);
    this.keyboardDocument.addEventListener('keyup', this.handleKeyUp);
  }

  public disposeKeyboard(): void {
    this.keyboardDocument?.removeEventListener('keydown', this.handleKeyDown);
    this.keyboardDocument?.removeEventListener('keyup', this.handleKeyUp);
    this.keyboardDocument = undefined; this.keys = {}; this.recomputeKeyboard();
  }

  // ---------- 触摸处理 ----------
  private onTouchStart(e: any): void {
    const t = e.touches && e.touches[0];
    if (!t || this.touchId !== null) return;
    this.touchId = t.identifier ?? 0;
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
    // 同时登记一次 tap（用于按钮命中）
    this.tapX = t.clientX;
    this.tapY = t.clientY;
  }

  private onTouchMove(e: any): void {
    if (this.touchId === null) return;
    const t = this.findTouch(e.touches, this.touchId);
    if (!t) return;
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;
    const dist = Math.hypot(dx, dy);
    if (dist < this.deadZone) {
      this.moveX = 0; this.moveY = 0;
      return;
    }
    const clamp = Math.min(dist, this.maxRadius) / this.maxRadius;
    this.moveX = (dx / dist) * clamp;
    this.moveY = (dy / dist) * clamp;
  }

  private onTouchEnd(_e: any): void {
    this.touchId = null;
    this.moveX = 0;
    this.moveY = 0;
  }

  private findTouch(list: any[], id: number): any | null {
    if (!list) return null;
    for (const t of list) if ((t.identifier ?? 0) === id) return t;
    return null;
  }

  // ---------- 键盘处理（PC 调试） ----------
  private recomputeKeyboard(): void {
    // 当有键盘输入时，覆盖触摸摇杆
    let x = 0, y = 0;
    const k = this.keys;
    if (k['ArrowLeft'] || k['KeyA']) x -= 1;
    if (k['ArrowRight'] || k['KeyD']) x += 1;
    if (k['ArrowUp'] || k['KeyW']) y -= 1;
    if (k['ArrowDown'] || k['KeyS']) y += 1;
    if (x !== 0 || y !== 0) {
      const n = Math.hypot(x, y);
      this.moveX = x / n;
      this.moveY = y / n;
    } else { this.moveX = 0; this.moveY = 0; }
  }

  private handleKeyboard(event: any, pressed: boolean): void {
    if (isTextInput(event?.target)) return;
    const code = typeof event?.code === 'string' ? event.code : '';
    if (!code) return;
    this.keys[code] = pressed; this.recomputeKeyboard();
  }

  public consumeTap(): void {
    this.tapX = null;
    this.tapY = null;
  }

  /** 关卡退出时清除摇杆、点击和键盘残留，下一局从干净输入开始。 */
  public reset(): void {
    this.moveX = 0; this.moveY = 0; this.tapX = null; this.tapY = null;
    this.touchId = null; this.keys = {};
  }

  /** 测试/脚本注入：直接模拟一次 tap */
  public simulateTap(x: number, y: number): void {
    this.tapX = x; this.tapY = y;
  }

  /** 测试/脚本注入：直接模拟摇杆向量 */
  public simulateMove(x: number, y: number): void {
    this.moveX = x; this.moveY = y;
  }
}

function isTextInput(target: any): boolean {
  const tag = typeof target?.tagName === 'string' ? target.tagName.toLowerCase() : '';
  return tag === 'input' || tag === 'textarea' || target?.isContentEditable === true;
}
