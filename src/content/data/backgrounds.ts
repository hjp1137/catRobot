import type { BackgroundTheme } from '../models/BackgroundTheme';

export const BACKGROUND_THEMES = [
  {
    id: 'background_training_ground_v1',
    name: '赛博训练场',
    description: '自由探索训练场默认主题。',
    art: {
      floorArtKey: 'map.trainingGround.floor',
      lineArtKey: 'map.trainingGround.line',
      boundaryArtKey: 'map.trainingGround.boundary',
      zoneMarkArtKey: 'map.trainingGround.zoneMark',
    },
    colors: {
      base: '#07121d',
      grid: 'rgba(79, 209, 224, 0.18)',
      boundary: '#ffb347',
      overlay: 'rgba(2, 6, 14, 0.28)',
    },
    rendering: {
      mode: 'world-tile',
      tileWidth: 512,
      tileHeight: 512,
      opacity: 1,
      overlayOpacity: 0.28,
      showGrid: true,
      showZoneMarks: true,
      showBoundary: true,
    },
    enabled: true,
    version: 1,
  },
  {
    id: 'background_forging_corridor_v1',
    name: '铸造通道',
    description: '固定屏 1-1 过渡主题，暂复用训练场资源。',
    art: {
      floorArtKey: 'map.trainingGround.floor',
      lineArtKey: 'map.trainingGround.line',
      boundaryArtKey: 'map.trainingGround.boundary',
      zoneMarkArtKey: 'map.trainingGround.zoneMark',
    },
    colors: {
      base: '#101018',
      grid: 'rgba(255, 179, 71, 0.16)',
      boundary: '#ff8c1a',
      overlay: 'rgba(2, 6, 14, 0.78)',
    },
    rendering: {
      mode: 'cover',
      opacity: 1,
      overlayOpacity: 0.78,
      showGrid: true,
      showZoneMarks: false,
      showBoundary: false,
    },
    enabled: true,
    version: 1,
  },
] as const satisfies BackgroundTheme[];
