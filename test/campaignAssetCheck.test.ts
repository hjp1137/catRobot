import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const libPath = path.resolve('scripts/check-campaign-assets-lib.cjs');

test('check:campaign exports a root-parameterized pure validator', () => {
  assert.equal(typeof require(libPath).validateCampaignAssets, 'function');
});

test('check:campaign accepts a declared virtual campaign icon', () => {
  const root = fixture();
  assert.doesNotThrow(() => validate(root));
  fs.rmSync(root, { recursive: true, force: true });
});

for (const [name, mutate] of [
  ['Invalid 状态', (entry: any) => { entry.status = 'invalid'; }],
  ['无发布版本', (entry: any) => { delete entry.versionId; }],
  ['物理文件不存在', (entry: any) => { entry.path = 'assets/missing.png'; }],
  ['物理文件 checksum 错误', (entry: any) => { entry.checksum = 'bad'; }],
] as const) {
  test(`check:campaign 拒绝章节背景${name}`, () => {
    const root = fixture();
    const artPath = path.join(root, 'content-store/published/art-manifest.snapshot.json');
    const art = JSON.parse(fs.readFileSync(artPath, 'utf8'));
    mutate(art.resources['map.trainingGround.floor']);
    writeArtSnapshot(root, art);
    assert.throws(() => validate(root));
    fs.rmSync(root, { recursive: true, force: true });
  });
}

for (const [name, mutate] of [
  ['内容未声明 Art Snapshot', (content: any) => { delete content.artManifestReleaseId; }],
  ['内容 Art checksum 不匹配', (content: any) => { content.artManifestChecksum = 'bad'; }],
  ['Art releaseId 不匹配', (content: any, art: any) => {
    art.releaseId = 'other-release'; art.checksum = checksum(art); content.artManifestChecksum = art.checksum;
  }],
  ['Art 自身 checksum 不稳定', (_content: any, art: any) => { art.generatedAt = 'tampered'; }],
] as const) {
  test(`check:campaign 拒绝${name}`, () => {
    const root = fixture();
    const contentPath = path.join(root, 'content-store/published/content.snapshot.json');
    const artPath = path.join(root, 'content-store/published/art-manifest.snapshot.json');
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const art = JSON.parse(fs.readFileSync(artPath, 'utf8'));
    mutate(content, art);
    fs.writeFileSync(contentPath, JSON.stringify(content));
    fs.writeFileSync(artPath, JSON.stringify(art));
    assert.throws(() => validate(root));
    fs.rmSync(root, { recursive: true, force: true });
  });
}

test('check:campaign CLI fixes production project root without a test environment override', () => {
  const source = fs.readFileSync(path.resolve('scripts/check-campaign-assets.cjs'), 'utf8');
  assert.doesNotMatch(source, /CAMPAIGN_CHECK_ROOT/);
  assert.match(source, /check-campaign-assets-lib/);
});

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'campaign-check-'));
  const published = path.join(root, 'content-store/published');
  const assetPath = 'assets/floor.png'; const fullAsset = path.join(root, assetPath);
  fs.mkdirSync(published, { recursive: true }); fs.mkdirSync(path.dirname(fullAsset), { recursive: true });
  fs.writeFileSync(fullAsset, 'physical-floor');
  const campaign: any = { schemaVersion: 1, releaseId: 'r8', releaseVersion: 'R000008', generatedAt: '', checksum: '',
    campaignCount: 1, chapterCount: 1, nodeCount: 2, campaigns: [{ id: 'main', chapters: [{ id: 'chapter_1', backgroundArtKey: 'map.trainingGround.floor',
      nodes: [{ id: 'n1', stageId: 's1', iconArtKey: 'icon.objective.enemy', isStart: true }, { id: 'n2', stageId: 's2', isEnd: true }],
      connections: [{ fromNodeId: 'n1', toNodeId: 'n2', enabled: true }] }] }] };
  campaign.checksum = checksum(campaign);
  const art: any = { schemaVersion: 1, releaseId: 'r8', releaseVersion: 'R000008', generatedAt: '', checksum: '', resources: {
    'map.trainingGround.floor': { status: 'physical', versionId: 'floor_v1', versionNo: 1,
      path: assetPath, width: 800, height: 1200, checksum: crypto.createHash('sha256').update('physical-floor').digest('hex') },
    'icon.objective.enemy': { status: 'virtual' },
  } };
  art.checksum = checksum(art);
  fs.writeFileSync(path.join(published, 'content.snapshot.json'), JSON.stringify({
    releaseVersion: 'R000008', campaignSnapshotReleaseId: 'r8', campaignSnapshotChecksum: campaign.checksum,
    artManifestReleaseId: 'r8', artManifestChecksum: art.checksum,
    stages: [{ id: 's1' }, { id: 's2' }],
  }));
  fs.writeFileSync(path.join(published, 'campaign.snapshot.json'), JSON.stringify(campaign));
  fs.writeFileSync(path.join(published, 'art-manifest.snapshot.json'), JSON.stringify(art));
  return root;
}

function writeArtSnapshot(root: string, art: any) {
  art.checksum = checksum(art);
  const published = path.join(root, 'content-store/published');
  fs.writeFileSync(path.join(published, 'art-manifest.snapshot.json'), JSON.stringify(art));
  const contentPath = path.join(published, 'content.snapshot.json');
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  content.artManifestChecksum = art.checksum;
  fs.writeFileSync(contentPath, JSON.stringify(content));
}

function checksum(value: any) {
  const sort = (item: any): any => Array.isArray(item) ? item.map(sort) : !item || typeof item !== 'object' ? item
    : Object.keys(item).sort().reduce((out, key) => { if (item[key] !== undefined) out[key] = sort(item[key]); return out; }, {} as any);
  return crypto.createHash('sha256').update(JSON.stringify(sort({ ...value, checksum: '' }), null, 2)).digest('hex');
}

function validate(root: string) {
  const lib = require(libPath);
  assert.equal(typeof lib.validateCampaignAssets, 'function');
  return lib.validateCampaignAssets(root);
}
