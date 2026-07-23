import { TUTORIAL_FEATURES } from './TutorialCatalog';

export class TutorialFeatureService {
  constructor(private player: any, private persist: () => void) {}

  isUnlocked(featureId: string): boolean {
    return this.player.tutorial.unlockedFeatureIds.includes(featureId);
  }

  unlock(featureId: string): boolean {
    if (!TUTORIAL_FEATURES.some(item => item.id === featureId) || this.isUnlocked(featureId)) return false;
    this.player.tutorial.unlockedFeatureIds.push(featureId);
    this.player.tutorial.pendingUnlockNoticeIds ??= [];
    if (!this.player.tutorial.pendingUnlockNoticeIds.includes(featureId)) this.player.tutorial.pendingUnlockNoticeIds.push(featureId);
    this.persist(); return true;
  }

  unlockSafe(featureIds: string[]): void {
    const safe = new Set(TUTORIAL_FEATURES.filter(item => item.safeOnSkip).map(item => item.id));
    for (const id of featureIds) if (safe.has(id)) this.unlock(id);
  }

  unlockDefaults(): void {
    for (const item of TUTORIAL_FEATURES) if (item.defaultUnlocked) this.unlock(item.id);
  }

  unlockAll(notify = true): void {
    let changed = false;
    this.player.tutorial.pendingUnlockNoticeIds ??= [];
    for (const item of TUTORIAL_FEATURES) {
      if (this.isUnlocked(item.id)) continue;
      this.player.tutorial.unlockedFeatureIds.push(item.id); changed = true;
      if (notify && !this.player.tutorial.pendingUnlockNoticeIds.includes(item.id)) {
        this.player.tutorial.pendingUnlockNoticeIds.push(item.id);
      }
    }
    if (changed) this.persist();
  }

  consumeNotice(featureId: string): boolean {
    const notices: string[] = this.player.tutorial.pendingUnlockNoticeIds ?? [];
    const index = notices.indexOf(featureId); if (index < 0) return false;
    notices.splice(index, 1); this.persist(); return true;
  }

  consumeNextNotice(): { id: string; name: string; notice: string } | null {
    const notices: string[] = this.player.tutorial.pendingUnlockNoticeIds ?? [];
    const featureId = notices.shift();
    if (!featureId) return null;
    this.persist();
    const feature = TUTORIAL_FEATURES.find(item => item.id === featureId);
    return feature ? { id: feature.id, name: feature.name, notice: feature.unlockNotice } : null;
  }
}
