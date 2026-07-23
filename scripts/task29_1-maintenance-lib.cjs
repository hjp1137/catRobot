const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../server/node_modules/sharp');

const TEST_CAMPAIGNS = new Set(['campaign_task29_gui', 'campaign_task29_gui_copy']);

function planTask29Cleanup({ campaigns = [], chapters = [], nodes = [], connections = [], releaseReferences = [] }) {
  const campaignIds = campaigns.filter(row => TEST_CAMPAIGNS.has(row.id) && row.deleted_at).map(row => row.id).sort();
  const chapterIds = chapters.filter(row => campaignIds.includes(row.campaign_id)).map(row => row.id).sort();
  return {
    campaignIds, chapterIds,
    nodeIds: nodes.filter(row => chapterIds.includes(row.chapter_id)).map(row => row.id).sort(),
    connectionIds: connections.filter(row => chapterIds.includes(row.chapter_id)).map(row => row.id).sort(),
    releaseReferences: releaseReferences.filter(row => campaignIds.includes(row.campaignId)),
  };
}

async function inspectArtFile(storagePath, root = process.cwd()) {
  const fullPath = path.resolve(root, storagePath);
  if (!fullPath.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(fullPath)) throw new Error(`art file unavailable: ${storagePath}`);
  const metadata = await sharp(fullPath).metadata();
  const mimeType = metadata.format === 'png' ? 'image/png' : metadata.format === 'jpeg' ? 'image/jpeg' : `image/${metadata.format}`;
  return { width: metadata.width ?? 0, height: metadata.height ?? 0, format: metadata.format ?? '', mimeType,
    channels: metadata.channels ?? 0, hasAlpha: Boolean(metadata.hasAlpha),
    checksum: crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex') };
}

async function cleanupTask29Data(db, releaseReferences = []) {
  const ids = [...TEST_CAMPAIGNS];
  const [campaigns, chapters] = await Promise.all([
    db.contentCampaign.findMany({ where: { id: { in: ids } } }),
    db.contentCampaignChapter.findMany({ where: { campaign_id: { in: ids } } }),
  ]);
  const chapterIds = chapters.map(row => row.id);
  const [nodes, connections] = await Promise.all([
    db.contentCampaignStageNode.findMany({ where: { chapter_id: { in: chapterIds } } }),
    db.contentCampaignNodeConnection.findMany({ where: { chapter_id: { in: chapterIds } } }),
  ]);
  const plan = planTask29Cleanup({ campaigns, chapters, nodes, connections, releaseReferences });
  if (plan.releaseReferences.length) throw new Error('refuse to delete archived GUI data referenced by release history');
  await db.$transaction(async tx => {
    if (plan.connectionIds.length) await tx.contentCampaignNodeConnection.deleteMany({ where: { id: { in: plan.connectionIds } } });
    if (plan.nodeIds.length) await tx.contentCampaignStageNode.deleteMany({ where: { id: { in: plan.nodeIds } } });
    if (plan.chapterIds.length) await tx.contentCampaignChapter.deleteMany({ where: { id: { in: plan.chapterIds } } });
    if (plan.campaignIds.length) await tx.contentCampaign.deleteMany({ where: { id: { in: plan.campaignIds }, deleted_at: { not: null } } });
  });
  return plan;
}

module.exports = { cleanupTask29Data, inspectArtFile, planTask29Cleanup };
