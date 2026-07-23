export class StageEditorSession<T = any> {
  private baseline: T;
  private currentValue: T;
  private past: T[] = [];
  private future: T[] = [];

  constructor(initial: T) {
    this.baseline = clone(initial);
    this.currentValue = clone(initial);
  }

  get current(): T { return clone(this.currentValue); }
  get dirty(): boolean { return JSON.stringify(this.currentValue) !== JSON.stringify(this.baseline); }
  get canUndo(): boolean { return this.past.length > 0; }
  get canRedo(): boolean { return this.future.length > 0; }

  commit(value: T): T {
    if (JSON.stringify(value) === JSON.stringify(this.currentValue)) return this.current;
    this.past.push(clone(this.currentValue));
    if (this.past.length > 80) this.past.shift();
    this.currentValue = clone(value);
    this.future = [];
    return this.current;
  }

  undo(): T {
    const value = this.past.pop();
    if (!value) return this.current;
    this.future.push(clone(this.currentValue));
    this.currentValue = value;
    return this.current;
  }

  redo(): T {
    const value = this.future.pop();
    if (!value) return this.current;
    this.past.push(clone(this.currentValue));
    this.currentValue = value;
    return this.current;
  }

  markSaved(value: T): T {
    this.currentValue = clone(value);
    this.baseline = clone(value);
    this.past = [];
    this.future = [];
    return this.current;
  }
}

export function logicalPoint(
  point: { x: number; y: number }, rect: { left: number; top: number; width: number; height: number },
  canvasWidth: number, canvasHeight: number, grid = 1,
) {
  const snap = (value: number) => Math.round(value / Math.max(1, grid)) * Math.max(1, grid);
  const x = snap((point.x - rect.left) / rect.width * canvasWidth);
  const y = snap((point.y - rect.top) / rect.height * canvasHeight);
  return { x: clamp(x, 0, canvasWidth), y: clamp(y, 0, canvasHeight) };
}

export function logicalRectFromPoints(
  first: { x: number; y: number }, last: { x: number; y: number }, canvasWidth: number, canvasHeight: number, grid = 1,
) {
  const snap = (value: number) => Math.round(value / Math.max(1, grid)) * Math.max(1, grid);
  const left = clamp(snap(Math.min(first.x, last.x)), 0, canvasWidth);
  const top = clamp(snap(Math.min(first.y, last.y)), 0, canvasHeight);
  const right = clamp(snap(Math.max(first.x, last.x)), 0, canvasWidth);
  const bottom = clamp(snap(Math.max(first.y, last.y)), 0, canvasHeight);
  return { x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}

export type CollisionTransform = 'move' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export function transformLogicalRect(
  original: { x: number; y: number; width: number; height: number }, first: { x: number; y: number }, last: { x: number; y: number },
  canvasWidth: number, canvasHeight: number, transform: CollisionTransform,
) {
  const dx = last.x - first.x; const dy = last.y - first.y;
  if (transform === 'move') {
    const width = Math.max(0, original.width); const height = Math.max(0, original.height);
    return { x: clamp(original.x + dx, 0, Math.max(0, canvasWidth - width)), y: clamp(original.y + dy, 0, Math.max(0, canvasHeight - height)), width, height };
  }
  let left = original.x; let top = original.y; let right = original.x + Math.max(0, original.width); let bottom = original.y + Math.max(0, original.height);
  if (transform.includes('w')) left = clamp(left + dx, 0, right);
  if (transform.includes('e')) right = clamp(right + dx, left, canvasWidth);
  if (transform.includes('n')) top = clamp(top + dy, 0, bottom);
  if (transform.includes('s')) bottom = clamp(bottom + dy, top, canvasHeight);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function keyboardDelta(key: string, shift: boolean, tagName = ''): { x: number; y: number } | null {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName.toUpperCase())) return null;
  const step = shift ? 10 : 1;
  return ({ ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } } as any)[key] ?? null;
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
