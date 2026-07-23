export type StageMode = 'fixed-battle' | 'explore';

export interface EnemyTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  behaviorType: string;
  visual: Record<string, unknown>;
  stats: Record<string, unknown>;
  combat: Record<string, unknown>;
  rewards?: Record<string, unknown>;
  tags?: string[];
  enabled: boolean;
  version: number;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  description?: string;
  art: Record<string, unknown>;
  colors?: Record<string, unknown>;
  rendering: Record<string, unknown>;
  enabled: boolean;
  version: number;
}

export interface HeroVisualTemplate {
  id: string;
  name: string;
  description?: string;
  visual: Record<string, unknown>;
  skills: Record<string, unknown>;
  enabled: boolean;
  version: number;
}

export interface StageDefinition {
  id: string;
  legacyStageId?: string;
  name: string;
  description?: string;
  mode: StageMode;
  heroVisualTemplateId: string;
  backgroundThemeId: string;
  waves?: unknown[];
  exploration?: Record<string, unknown>;
  objectives?: unknown[];
  enabled: boolean;
  version: number;
}

export interface ContentSnapshot {
  schemaVersion: 1;
  releaseId: string;
  releaseVersion: string;
  generatedAt: string;
  checksum: string;
  animationManifestReleaseId?: string;
  animationManifestChecksum?: string;
  enemies: EnemyTemplate[];
  backgrounds: BackgroundTheme[];
  heroVisuals: HeroVisualTemplate[];
  stages: StageDefinition[];
  animationClips?: unknown[];
}
