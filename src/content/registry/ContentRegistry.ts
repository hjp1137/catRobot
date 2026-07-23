import type { ContentRepository } from '../repositories/ContentRepository';
import type { ContentDataSet, ContentKind } from '../models/ContentTypes';
import type { EnemyTemplate } from '../models/EnemyTemplate';
import type { BackgroundTheme } from '../models/BackgroundTheme';
import type { HeroVisualTemplate } from '../models/HeroVisualTemplate';
import type { StageDefinition } from '../models/StageDefinition';
import { LocalContentRepository } from '../repositories/LocalContentRepository';

type Entity = { id: string };

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
    }
  }
  return value;
}

function mapById<T extends Entity>(kind: ContentKind, values: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const value of values) {
    if (map.has(value.id)) throw new Error(`[ContentRegistry] duplicate ${kind} id: ${value.id}`);
    map.set(value.id, deepFreeze(value));
  }
  return map;
}

export class ContentRegistry {
  private constructor(
    private enemies: Map<string, EnemyTemplate>,
    private backgrounds: Map<string, BackgroundTheme>,
    private heroes: Map<string, HeroVisualTemplate>,
    private stages: Map<string, StageDefinition>,
  ) {}

  static async load(repository: ContentRepository): Promise<ContentRegistry> {
    return ContentRegistry.fromData({
      enemies: await repository.loadEnemies(),
      backgrounds: await repository.loadBackgrounds(),
      heroes: await repository.loadHeroVisuals(),
      stages: await repository.loadStages(),
    });
  }

  static fromData(data: ContentDataSet): ContentRegistry {
    return new ContentRegistry(
      mapById('enemy', data.enemies),
      mapById('background', data.backgrounds),
      mapById('heroVisual', data.heroes),
      mapById('stage', data.stages),
    );
  }

  getEnemy(id: string): EnemyTemplate { return this.get(this.enemies, 'enemy', id); }
  getBackground(id: string): BackgroundTheme { return this.get(this.backgrounds, 'background', id); }
  getHeroVisual(id: string): HeroVisualTemplate { return this.get(this.heroes, 'heroVisual', id); }
  getStage(id: string): StageDefinition { return this.get(this.stages, 'stage', id); }

  listEnemies(): EnemyTemplate[] { return [...this.enemies.values()]; }
  listBackgrounds(): BackgroundTheme[] { return [...this.backgrounds.values()]; }
  listHeroVisuals(): HeroVisualTemplate[] { return [...this.heroes.values()]; }
  listStages(): StageDefinition[] { return [...this.stages.values()]; }

  private get<T>(map: Map<string, T>, kind: ContentKind, id: string): T {
    const value = map.get(id);
    if (!value) throw new Error(`[ContentRegistry] missing ${kind} template: ${id}`);
    return value;
  }
}

let defaultRegistry: ContentRegistry | null = null;
let defaultRepository: LocalContentRepository | null = null;

export function getDefaultContentRegistry(): ContentRegistry {
  if (!defaultRegistry) {
    defaultRepository = new LocalContentRepository();
    defaultRegistry = ContentRegistry.fromData(defaultRepository.getContentData());
  }
  return defaultRegistry;
}

export function getDefaultContentRepository(): LocalContentRepository {
  if (!defaultRepository) getDefaultContentRegistry();
  return defaultRepository as LocalContentRepository;
}
