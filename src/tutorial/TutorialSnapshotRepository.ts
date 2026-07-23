import type { TutorialSnapshot } from '../content/models/Tutorial';
import { validateTutorialPublication } from '../../shared/tutorial-publication-validation/index.js';
import { computeTutorialSnapshotChecksum } from './TutorialSnapshotChecksum';

export type TutorialSnapshotMode = 'PUBLISHED' | 'LEGACY_FALLBACK';

export class TutorialSnapshotRepository {
  public readonly mode: TutorialSnapshotMode;
  public readonly snapshot: TutorialSnapshot | null;
  public readonly reason?: string;

  constructor(content: any, tutorial: TutorialSnapshot | null | undefined) {
    if (!content?.tutorialSnapshotReleaseId || !content?.tutorialSnapshotChecksum) {
      this.mode = 'LEGACY_FALLBACK'; this.snapshot = null; this.reason = 'tutorial-snapshot-not-declared'; return;
    }
    if (!tutorial || tutorial.releaseId !== content.tutorialSnapshotReleaseId || tutorial.releaseId !== content.releaseId) {
      this.mode = 'LEGACY_FALLBACK'; this.snapshot = null; this.reason = 'tutorial-release-mismatch'; return;
    }
    if (tutorial.checksum !== content.tutorialSnapshotChecksum ||
      computeTutorialSnapshotChecksum(tutorial) !== tutorial.checksum) {
      this.mode = 'LEGACY_FALLBACK'; this.snapshot = null; this.reason = 'tutorial-checksum-mismatch'; return;
    }
    if (validateTutorialPublication(tutorial).length) {
      this.mode = 'LEGACY_FALLBACK'; this.snapshot = null; this.reason = 'tutorial-structure-invalid'; return;
    }
    this.mode = 'PUBLISHED'; this.snapshot = tutorial;
  }
}
