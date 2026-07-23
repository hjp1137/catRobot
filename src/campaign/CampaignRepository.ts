import { CONTENT_SNAPSHOT } from '../content/generated/contentSnapshot';
import { CAMPAIGN_SNAPSHOT } from '../content/generated/campaignSnapshot';
import type { CampaignDefinition, CampaignSnapshot } from '../content/models/Campaign';

export interface CampaignManifestRef {
  campaignSnapshotReleaseId?: string;
  campaignSnapshotChecksum?: string;
}

export function resolvePublishedCampaigns(
  snapshot: CampaignSnapshot = CAMPAIGN_SNAPSHOT,
  content: CampaignManifestRef = CONTENT_SNAPSHOT as CampaignManifestRef,
): CampaignDefinition[] {
  if (!content.campaignSnapshotReleaseId || !content.campaignSnapshotChecksum) return [];
  if (content.campaignSnapshotReleaseId !== snapshot.releaseId) return [];
  if (content.campaignSnapshotChecksum !== snapshot.checksum) return [];
  if (snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.campaigns)) return [];
  return snapshot.campaigns.filter(campaign => campaign.enabled);
}

export function findPublishedCampaign(id?: string): CampaignDefinition | undefined {
  const campaigns = resolvePublishedCampaigns();
  return id ? campaigns.find(item => item.id === id) : campaigns[0];
}
