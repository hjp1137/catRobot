export function selectTutorialArtVersion(row: any, versionById: Map<string, any>): any | undefined {
  if (!row || row.enabled === false || row.deleted_at || row.resource_status !== 'physical') return undefined;
  const versionId = row.current_draft_version_id ?? row.published_version_id;
  if (!versionId) return undefined;
  const version = versionById.get(versionId);
  if (!version || version.validation_status === 'invalid') return undefined;
  if (!version.storage_path || !version.checksum) return undefined;
  if (!(version.actual_width > 0) || !(version.actual_height > 0)) return undefined;
  return version;
}
