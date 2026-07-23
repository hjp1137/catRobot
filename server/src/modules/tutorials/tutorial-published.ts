import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { projectRoot } from '../../common/utils/safe-path';
import { validateTutorialPublication } from '../../../../shared/tutorial-publication-validation';

export function readPublishedTutorial(root = projectRoot()): any {
  const safeRoot = path.resolve(root);
  const contentPath = path.resolve(safeRoot, 'content-store/published/content.snapshot.json');
  if (!fs.existsSync(contentPath)) return fallback('content-snapshot-missing');
  try {
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    if (!content.tutorialSnapshotReleaseId || !content.tutorialSnapshotChecksum || !content.tutorialSnapshotPath) {
      return fallback('tutorial-snapshot-not-declared');
    }
    if (content.tutorialSnapshotPath !== 'content-store/published/tutorial.snapshot.json') {
      return fallback('tutorial-snapshot-path-invalid');
    }
    const snapshotPath = path.resolve(safeRoot, content.tutorialSnapshotPath);
    if (!snapshotPath.startsWith(safeRoot + path.sep) || !fs.existsSync(snapshotPath)) return fallback('tutorial-snapshot-missing');
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    if (snapshot.releaseId !== content.tutorialSnapshotReleaseId || snapshot.releaseId !== content.releaseId) {
      return fallback('tutorial-release-mismatch');
    }
    const actual = checksum({ ...snapshot, checksum: '' });
    if (actual !== snapshot.checksum || actual !== content.tutorialSnapshotChecksum) return fallback('tutorial-checksum-mismatch');
    if (validateTutorialPublication(snapshot).length) return fallback('tutorial-structure-invalid');
    return { mode: 'PUBLISHED', source: 'published-tutorial-snapshot', ...snapshot };
  } catch { return fallback('tutorial-snapshot-invalid'); }
}

function checksum(value: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(sortValue(value), null, 2)).digest('hex');
}
function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((out: any, key) => { if (value[key] !== undefined) out[key] = sortValue(value[key]); return out; }, {});
}
function fallback(reason: string) { return { mode: 'LEGACY_FALLBACK', reason, flows: [] }; }
