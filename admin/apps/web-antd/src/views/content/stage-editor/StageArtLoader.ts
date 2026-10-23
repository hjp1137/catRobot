export type StageArtResource = {
  thumbnailUrl?: string | null;
  originalUrl?: string | null;
};

export async function loadStageArtUrls(options: {
  artKeys: string[];
  resolveResource: (artKey: string) => Promise<StageArtResource | undefined>;
  fetchBlobUrl: (url: string) => Promise<string>;
  concurrency?: number;
}) {
  const urls: Record<string, string> = {};
  const failedKeys: string[] = [];
  const keys = [...new Set(options.artKeys.filter(Boolean))];
  const workerCount = Math.min(Math.max(1, options.concurrency ?? 4), keys.length);
  let cursor = 0;

  async function loadNext() {
    while (cursor < keys.length) {
      const artKey = keys[cursor++];
      const resource = await options.resolveResource(artKey).catch(() => undefined);
      const candidates = [resource?.thumbnailUrl, resource?.originalUrl].filter((url): url is string => Boolean(url));
      let loaded = false;
      for (const url of candidates) {
        try {
          const blobUrl = await options.fetchBlobUrl(url);
          if (!blobUrl) continue;
          urls[artKey] = blobUrl;
          loaded = true;
          break;
        } catch { /* Try the original image before declaring the resource missing. */ }
      }
      if (!loaded) failedKeys.push(artKey);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, loadNext));
  return { urls, failedKeys };
}
