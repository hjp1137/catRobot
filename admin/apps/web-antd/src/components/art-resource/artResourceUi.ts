export type ArtResourceRow = Record<string, any>;

export function currentVersion(row?: ArtResourceRow) {
  return row?.displayVersion ?? row?.currentDraftVersion ?? row?.publishedVersion ?? null;
}

export function isDraftChanged(row?: ArtResourceRow): boolean {
  return Boolean(row?.current_draft_version_id && row.current_draft_version_id !== row.published_version_id);
}

export function resourceStatusBlocked(row?: ArtResourceRow): boolean {
  const status = row?.status ?? row?.resource_status;
  return !row || status === 'missing' || status === 'invalid' || row.currentDraftVersion?.validation_status === 'invalid';
}

export function resourceStatusColor(row?: ArtResourceRow): string {
  const status = row?.status ?? row?.resource_status;
  if (!row) return 'red';
  if (status === 'missing') return 'red';
  if (status === 'invalid') return 'red';
  if (row.currentDraftVersion?.validation_status === 'invalid') return 'red';
  if (isDraftChanged(row)) return 'gold';
  if (status === 'physical') return 'green';
  if (status === 'virtual') return 'blue';
  return 'default';
}

export function resourceSize(row?: ArtResourceRow): string {
  const version = currentVersion(row);
  const width = row?.width ?? version?.actual_width ?? row?.expected_width ?? '-';
  const height = row?.height ?? version?.actual_height ?? row?.expected_height ?? '-';
  return `${width}x${height}`;
}

export function checksumShort(value?: string): string {
  return value ? value.slice(0, 16) : '-';
}

export function fileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function previewArtKey(kind: string, row: any): string | undefined {
  if (kind === 'enemies') return row.visual?.idleArtKey ?? row.visual?.iconArtKey ?? row.visual?.moveArtKey;
  if (kind === 'backgrounds') return row.art?.backgroundArtKey ?? row.art?.floorArtKey ?? row.art?.lineArtKey;
  if (kind === 'heroes') return row.visual?.idleArtKey ?? row.visual?.iconArtKey;
  return undefined;
}
