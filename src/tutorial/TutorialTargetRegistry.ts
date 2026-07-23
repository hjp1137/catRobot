export type TutorialTargetType = 'ui' | 'canvas';
export interface TutorialBounds { x: number; y: number; width: number; height: number; }
export interface ResolvedTutorialTarget { type: TutorialTargetType; id: string; bounds: TutorialBounds; }
export type TutorialTargetResolver = () => TutorialBounds | null;

export class TutorialTargetRegistry {
  private resolvers = new Map<string, TutorialTargetResolver>();
  private cache = new Map<string, ResolvedTutorialTarget>();

  register(type: TutorialTargetType, id: string, resolver: TutorialTargetResolver): () => void {
    const key = this.key(type, id); this.resolvers.set(key, resolver); this.cache.delete(key);
    return () => this.unregister(type, id);
  }

  unregister(type: TutorialTargetType, id: string): void {
    const key = this.key(type, id); this.resolvers.delete(key); this.cache.delete(key);
  }

  resolve(type: TutorialTargetType, id: string, refresh = false): ResolvedTutorialTarget | null {
    const key = this.key(type, id); if (!refresh && this.cache.has(key)) return this.cache.get(key)!;
    const bounds = this.resolvers.get(key)?.();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) { this.cache.delete(key); return null; }
    const target = { type, id, bounds }; this.cache.set(key, target); return target;
  }

  invalidate(): void { this.cache.clear(); }
  private key(type: TutorialTargetType, id: string): string { return `${type}:${id}`; }
}
