import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { checkTutorialAssets, checksum } = require(path.resolve('scripts/check-tutorial-assets-lib.cjs'));

test('check:tutorial accepts current R7 legacy fallback', () => {
  const root = temp(); write(root, 'content-store/published/content.snapshot.json', { releaseId: 'r7' });
  try { assert.equal(checkTutorialAssets({ root }).mode, 'LEGACY_FALLBACK'); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('check:tutorial validates a declared Tutorial snapshot', () => {
  const root = fixture();
  try { const result = checkTutorialAssets({ root }); assert.equal(result.valid, true); assert.equal(result.mode, 'PUBLISHED'); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('check:tutorial rejects self-checksummed invalid structure, counts and summary', () => {
  const root = fixture();
  try {
    const file = path.join(root, 'content-store/published/tutorial.snapshot.json');
    const value = JSON.parse(fs.readFileSync(file, 'utf8')); value.flows[0].steps[0].targetId = 'missing';
    value.flowCount = 2; value.referenceSummary.campaignIds = []; value.checksum = checksum({ ...value, checksum: '' });
    fs.writeFileSync(file, JSON.stringify(value));
    const contentFile = path.join(root, 'content-store/published/content.snapshot.json');
    const content = JSON.parse(fs.readFileSync(contentFile, 'utf8')); content.tutorialSnapshotChecksum = value.checksum;
    fs.writeFileSync(contentFile, JSON.stringify(content));
    const result = checkTutorialAssets({ root }); assert.equal(result.valid, false);
    assert.ok(result.errors.some((x: string) => x.includes('Target')));
    assert.ok(result.errors.some((x: string) => x.includes('flowCount')));
    assert.ok(result.errors.some((x: string) => x.includes('referenceSummary')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('check:tutorial rejects a missing arrow Art Key', () => {
  const root = fixture();
  try {
    const file = path.join(root, 'content-store/published/tutorial.snapshot.json');
    const value = JSON.parse(fs.readFileSync(file, 'utf8'));
    value.flows[0].steps[0].arrow = { artKey: 'ui.tutorial.arrow' };
    value.referenceSummary.artKeys = ['ui.tutorial.arrow'];
    value.referenceSummary.catalog.artKeys = [];
    value.checksum = checksum({ ...value, checksum: '' });
    fs.writeFileSync(file, JSON.stringify(value));
    const contentFile = path.join(root, 'content-store/published/content.snapshot.json');
    const content = JSON.parse(fs.readFileSync(contentFile, 'utf8')); content.tutorialSnapshotChecksum = value.checksum;
    fs.writeFileSync(contentFile, JSON.stringify(content));
    const result = checkTutorialAssets({ root }); assert.equal(result.valid, false);
    assert.ok(result.errors.some((x: string) => x.includes('引导箭头')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

function fixture() {
  const root = temp(); const flow = { id: 'flow', campaignId: 'campaign', startStepId: 'step', steps: [{ id: 'step',
    triggerType: 'app.ready', completionType: 'dialog.acknowledged', targetType: 'ui', targetId: 'home.campaign',
    title: '完成', body: '完成', terminal: true, force: false, blockInput: false, timeoutMs: 1000 }], transitions: [], unlockRules: [] };
  const snapshot: any = { schemaVersion: 1, releaseId: 'r8', releaseVersion: 'R000008', generatedAt: 'now', checksum: '',
    flowCount: 1, stepCount: 1, featureUnlockRuleCount: 0, referenceSummary: { campaignIds: ['campaign'], stageIds: [],
      featureIds: [], artKeys: [], catalog: { campaignIds: ['campaign'], stageIds: [], featureIds: [], artKeys: [] } }, flows: [flow] };
  snapshot.checksum = checksum(snapshot);
  write(root, 'content-store/published/tutorial.snapshot.json', snapshot);
  write(root, 'content-store/published/content.snapshot.json', { releaseId: 'r8', stages: [], campaignDefinitions: [{ id: 'campaign' }],
    tutorialSnapshotReleaseId: 'r8', tutorialSnapshotChecksum: snapshot.checksum,
    tutorialSnapshotPath: 'content-store/published/tutorial.snapshot.json' });
  write(root, 'content-store/published/art-manifest.snapshot.json', { resources: {} }); return root;
}
function temp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'tutorial-check-')); }
function write(root: string, rel: string, value: unknown) { const target = path.join(root, rel); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(value)); }
