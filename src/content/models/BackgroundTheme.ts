import type { ArtResourceKey } from '../../assets/ArtResourceKeys';

export interface BackgroundArtConfig {
  backgroundArtKey?: ArtResourceKey;
  floorArtKey: ArtResourceKey;
  lineArtKey?: ArtResourceKey;
  boundaryArtKey?: ArtResourceKey;
  zoneMarkArtKey?: ArtResourceKey;
  decorationArtKeys?: ArtResourceKey[];
}

export interface BackgroundColorConfig {
  base?: string;
  grid?: string;
  boundary?: string;
  overlay?: string;
}

export interface BackgroundRenderConfig {
  mode: 'stretch' | 'cover' | 'tile' | 'world-tile';
  tileWidth?: number;
  tileHeight?: number;
  opacity?: number;
  overlayOpacity?: number;
  showGrid?: boolean;
  showZoneMarks?: boolean;
  showBoundary?: boolean;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  description?: string;
  art: BackgroundArtConfig;
  colors?: BackgroundColorConfig;
  rendering: BackgroundRenderConfig;
  enabled: boolean;
  version: number;
}
