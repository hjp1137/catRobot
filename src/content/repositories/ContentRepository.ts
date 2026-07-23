import type { EnemyTemplate } from '../models/EnemyTemplate';
import type { BackgroundTheme } from '../models/BackgroundTheme';
import type { HeroVisualTemplate } from '../models/HeroVisualTemplate';
import type { StageDefinition } from '../models/StageDefinition';

export interface ContentRepository {
  loadEnemies(): Promise<EnemyTemplate[]>;
  loadBackgrounds(): Promise<BackgroundTheme[]>;
  loadHeroVisuals(): Promise<HeroVisualTemplate[]>;
  loadStages(): Promise<StageDefinition[]>;
}
