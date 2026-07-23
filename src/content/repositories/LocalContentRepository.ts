import type { ContentRepository } from './ContentRepository';
import type { EnemyTemplate } from '../models/EnemyTemplate';
import type { BackgroundTheme } from '../models/BackgroundTheme';
import type { HeroVisualTemplate } from '../models/HeroVisualTemplate';
import type { StageDefinition } from '../models/StageDefinition';
import type { ContentDataSet, ContentRepositorySource, ContentSnapshot, ContentSnapshotMeta } from '../models/ContentTypes';
import { ENEMY_TEMPLATES } from '../data/enemies';
import { BACKGROUND_THEMES } from '../data/backgrounds';
import { HERO_VISUAL_TEMPLATES } from '../data/heroes';
import { STAGE_DEFINITIONS } from '../data/stages';
import { ANIMATION_CLIPS } from '../data/animations';
import { CONTENT_SNAPSHOT } from '../generated/contentSnapshot';
import { validateContentData } from '../validation/ContentValidator';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class LocalContentRepository implements ContentRepository {
  private readonly snapshot: ContentSnapshot | null;
  private cachedContent: ContentDataSet | null = null;
  private source: ContentRepositorySource = 'built-in-default';

  constructor(options: { snapshot?: ContentSnapshot | null } = {}) {
    this.snapshot = options.snapshot === undefined ? CONTENT_SNAPSHOT : options.snapshot;
  }

  async loadEnemies(): Promise<EnemyTemplate[]> {
    return clone(this.loadContent().enemies);
  }

  async loadBackgrounds(): Promise<BackgroundTheme[]> {
    return clone(this.loadContent().backgrounds);
  }

  async loadHeroVisuals(): Promise<HeroVisualTemplate[]> {
    return clone(this.loadContent().heroes);
  }

  async loadStages(): Promise<StageDefinition[]> {
    return clone(this.loadContent().stages);
  }

  getContentData(): ContentDataSet {
    return clone(this.loadContent());
  }

  getRepositorySource(): ContentRepositorySource {
    this.loadContent();
    return this.source;
  }

  getSnapshotMeta(): ContentSnapshotMeta | null {
    if (!this.snapshot) return null;
    this.loadContent();
    return {
      releaseId: this.snapshot.releaseId,
      releaseVersion: this.snapshot.releaseVersion,
      snapshotChecksum: this.snapshot.checksum,
    };
  }

  private loadContent(): ContentDataSet {
    if (this.cachedContent) return this.cachedContent;
    if (!this.snapshot) {
      this.cachedContent = builtInContent();
      return this.cachedContent;
    }
    this.cachedContent = this.contentFromSnapshot(this.snapshot);
    this.source = 'mysql-published-snapshot';
    return this.cachedContent;
  }

  private contentFromSnapshot(snapshot: ContentSnapshot): ContentDataSet {
    const content = {
      enemies: snapshot.enemies,
      backgrounds: snapshot.backgrounds,
      heroes: snapshot.heroes ?? snapshot.heroVisuals ?? [],
      stages: snapshot.stages,
      animationClips: snapshot.animationClips ?? [],
    };
    assertSnapshotContent(snapshot, content);
    return clone(content);
  }
}

function builtInContent(): ContentDataSet {
  return {
    enemies: clone(ENEMY_TEMPLATES),
    backgrounds: clone(BACKGROUND_THEMES),
    heroes: clone(HERO_VISUAL_TEMPLATES),
    stages: clone(STAGE_DEFINITIONS),
    animationClips: clone(ANIMATION_CLIPS),
  };
}

function assertSnapshotContent(snapshot: ContentSnapshot, content: ContentDataSet): void {
  const missing = [
    content.enemies.length ? '' : 'enemies',
    content.backgrounds.length ? '' : 'backgrounds',
    content.heroes.length ? '' : 'heroes',
    content.stages.length ? '' : 'stages',
  ].filter(Boolean);
  if (snapshot.schemaVersion !== 1 || missing.length) {
    throw new Error(`CONTENT_SNAPSHOT 非法：${missing.join(',') || 'schemaVersion'}`);
  }
  const result = validateContentData(content);
  if (!result.valid) {
    const first = result.errors[0];
    throw new Error(`CONTENT_SNAPSHOT 校验失败：${first.objectId}.${first.field} ${first.reason}`);
  }
}
