import { ART_MANIFEST, ART_PACKS, ArtResourceEntry } from './ArtManifest';
import { ArtResourceKey } from './ArtResourceKeys';
import { ART_MANIFEST_SNAPSHOT } from './generated/artManifestSnapshot';

export function getArtResource(key: ArtResourceKey): ArtResourceEntry {
  const snapshotEntry = getSnapshotResource(key);
  if (snapshotEntry) {
    return snapshotEntry;
  }
  const entry = (ART_MANIFEST as Partial<Record<ArtResourceKey, ArtResourceEntry>>)[key];
  if (!entry) {
    console.error(`[ArtResolver] 找不到 Key 为 "${key}" 的资源配置`);
    return ART_MANIFEST['placeholder.image'];
  }
  return entry;
}

export function hasArtResource(key: ArtResourceKey): boolean {
  return Boolean(getSnapshotResource(key)
    ?? (ART_MANIFEST as Partial<Record<ArtResourceKey, ArtResourceEntry>>)[key]);
}

export function getArtPath(key: ArtResourceKey): string {
  // 1. 如果启用了 training_ground_v1，执行 P0 核心资源的 Key 或路径覆盖重定向
  if (ART_PACKS.training_ground_v1.enabled) {
    if (key === 'player.mecha.normal') {
      return getArtPath('player.mechaCat.idle');
    }
    if (key === 'enemy.rat.normal') {
      return getArtPath('enemy.scrapMouse.normal');
    }
    if (key === 'enemy.eliteMouse') {
      return getArtPath('enemy.scrapGuard.elite');
    }
    if (key === 'main.bg') {
      return getArtPath('map.trainingGround.floor');
    }
  }

  // 2. 正常读取与包状态、虚拟属性解析
  const entry = getArtResource(key);
  const packConfig = (ART_PACKS as any)[entry.pack];
  const isPackEnabled = packConfig ? packConfig.enabled : true;

  if (isPackEnabled && !entry.virtual) {
    return entry.path;
  }

  // 如果包未启用或者是虚拟资源，则回退到 fallback
  if (entry.fallback && entry.fallback !== key) {
    return getArtPath(entry.fallback);
  }

  return ART_MANIFEST['placeholder.image'].path;
}

export function getArtFallback(key: ArtResourceKey): string {
  const entry = getArtResource(key);
  if (entry.fallback) {
    return getArtPath(entry.fallback);
  }
  return ART_MANIFEST['placeholder.image'].path;
}

function getSnapshotResource(key: ArtResourceKey): ArtResourceEntry | undefined {
  const entry = (ART_MANIFEST_SNAPSHOT.resources as Record<string, any>)[key];
  if (!entry?.path) return undefined;
  return {
    path: entry.path,
    type: entry.type,
    pack: entry.pack,
    fallback: entry.fallback,
    width: entry.width,
    height: entry.height,
    transparent: entry.hasAlpha,
  } as ArtResourceEntry;
}
