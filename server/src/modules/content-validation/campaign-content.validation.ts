import { validateCampaignMap } from '../content/campaign.validation';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { projectRoot } from '../../common/utils/safe-path';
import { readImageMetadata } from '../../common/utils/image-metadata';

export function validateCampaignContent(
  errors: any[], campaigns: any[], chapters: any[], nodes: any[], connections: any[],
  stageById: Map<string, any>, artByKey: Map<string, any>, versionById = new Map<string, any>(),
) {
  const campaignIds = new Set<string>(); const chapterIds = new Set<string>();
  const activeCampaigns = campaigns.filter(item => item.enabled !== false && !item.deleted_at);
  const activeChapters = chapters.filter(item => item.enabled !== false && !item.deleted_at);
  for (const campaign of activeCampaigns) {
    if (campaignIds.has(campaign.id)) push(errors, 'campaign', campaign.id, 'id', 'Campaign ID重复');
    campaignIds.add(campaign.id);
    const own = activeChapters.filter(item => item.campaign_id === campaign.id);
    if (!own.length) push(errors, 'campaign', campaign.id, 'chapters', '战役至少需要一个启用章节');
    if (campaign.default_chapter_id && !own.some(item => item.id === campaign.default_chapter_id)) push(errors, 'campaign', campaign.id, 'defaultChapterId', '默认章节不存在');
    validateArt(errors, 'campaign', campaign.id, 'coverArtKey', campaign.cover_art_key, artByKey, versionById, false);
  }
  for (const chapter of activeChapters) {
    if (chapterIds.has(chapter.id)) push(errors, 'campaignChapter', chapter.id, 'id', 'Chapter ID重复');
    chapterIds.add(chapter.id);
    if (!campaignIds.has(chapter.campaign_id)) push(errors, 'campaignChapter', chapter.id, 'campaignId', '所属战役不存在');
    validateArt(errors, 'campaignChapter', chapter.id, 'backgroundArtKey', chapter.background_art_key, artByKey, versionById, true);
    const ownNodes = nodes.filter(item => item.chapter_id === chapter.id && item.enabled !== false);
    const ownConnections = connections.filter(item => item.chapter_id === chapter.id && item.enabled !== false);
    for (const node of ownNodes) {
      const stage = stageById.get(node.stage_id);
      if (!stage) push(errors, 'campaignNode', node.id, 'stageId', '关卡不存在或未启用');
      else if (stage.mode !== 'explore') push(errors, 'campaignNode', node.id, 'stageId', '正式章节关卡必须使用自由地图运行模式');
      validateArt(errors, 'campaignNode', node.id, 'iconArtKey', node.icon_art_key, artByKey, versionById, false);
    }
    try { validateCampaignMap({ nodes: ownNodes.map(nodeModel), connections: ownConnections.map(connectionModel) }); }
    catch (error) { push(errors, 'campaignChapter', chapter.id, 'map', (error as Error).message); }
  }
}

function validateArt(errors: any[], type: string, id: string, field: string, key: string | null,
  art: Map<string, any>, versions: Map<string, any>, required: boolean) {
  if (!key) { if (required) push(errors, type, id, field, 'Art Key必填'); return; }
  const row = art.get(key);
  if (!row || ['missing', 'invalid'].includes(row.resource_status)) {
    push(errors, type, id, field, 'Art Key不存在或不可用'); return;
  }
  if (row.resource_status !== 'physical') return;
  const versionId = row.current_draft_version_id ?? row.published_version_id;
  const version = versionId ? versions.get(versionId) : undefined;
  if (!version) { push(errors, type, id, field, 'Art Key缺少有效草稿或发布版本'); return; }
  if (version.validation_status === 'invalid') {
    push(errors, type, id, field, 'Art Key版本状态Invalid'); return;
  }
  if (!version.checksum) {
    push(errors, type, id, field, 'Art Key版本缺少checksum'); return;
  }
  const fullPath = path.resolve(projectRoot(), version.storage_path ?? '');
  if (!version.storage_path || !fullPath.startsWith(projectRoot() + path.sep) || !fs.existsSync(fullPath)) {
    push(errors, type, id, field, 'Art Key物理文件不存在'); return;
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
  if (actual !== version.checksum) { push(errors, type, id, field, 'Art Key checksum不一致'); return; }
  const width = version.actual_width; const height = version.actual_height;
  if (!(width > 0) || !(height > 0)) { push(errors, type, id, field, 'Art Key版本实际尺寸必须大于0'); return; }
  const metadata = readImageMetadata(fullPath);
  if (!metadata) { push(errors, type, id, field, 'Art Key文件图片元数据无效'); return; }
  if (metadata.width !== width || metadata.height !== height) {
    push(errors, type, id, field, 'Art Key文件实际尺寸与版本声明不一致'); return;
  }
  if (typeof version.has_alpha === 'boolean' && metadata.hasAlpha !== version.has_alpha) {
    push(errors, type, id, field, 'Art Key文件透明通道与版本声明不一致'); return;
  }
  if (row.dimension_policy === 'exact' &&
    ((row.expected_width && row.expected_width !== width) || (row.expected_height && row.expected_height !== height))) {
    push(errors, type, id, field, 'Art Key尺寸不符合exact规则'); return;
  }
  if (row.required_alpha && !metadata.hasAlpha) push(errors, type, id, field, 'Art Key缺少必要透明通道');
}
function nodeModel(row: any) { return { id: row.id, stageId: row.stage_id, x: row.x, y: row.y,
  type: row.node_type, isStart: row.is_start, isEnd: row.is_end, enabled: row.enabled }; }
function connectionModel(row: any) { return { id: row.id, fromNodeId: row.from_node_id, toNodeId: row.to_node_id,
  pathType: row.path_type, enabled: row.enabled }; }
function push(errors: any[], file: string, objectId: string, field: string, reason: string) { errors.push({ file, objectId, field, reason }); }
