import type { CampaignDefinition } from '../../src/content/models/Campaign.ts';
import { LEGACY_CAMPAIGN_FALLBACK_FIXTURE } from './legacyCampaignFixture.ts';

interface LegacyStageFixture {
  id: string;
  legacyStageId: string;
  runtimeMode: 'fixed-screen';
}

interface LegacyReleaseFixture {
  name: string;
  mode: 'LEGACY_FALLBACK';
  release: { id: string; version: string; campaignSnapshot: null };
  legacyContent: { chapters: string[]; stages: LegacyStageFixture[] };
  publishedCampaigns: CampaignDefinition[];
}

/**
 * R000007 没有 Campaign 快照时的已发布内容形态。
 * 它完全由测试描述，绝不读取 content-store/published 或当前 Release。
 */
export const LEGACY_R000007_RELEASE_FIXTURE: LegacyReleaseFixture = {
  name: LEGACY_CAMPAIGN_FALLBACK_FIXTURE.name,
  mode: LEGACY_CAMPAIGN_FALLBACK_FIXTURE.mode,
  release: { id: 'legacy-release-r000007', version: 'R000007', campaignSnapshot: null },
  legacyContent: {
    chapters: ['chapter1'],
    stages: [
      { id: 'stage_battle_1_1', legacyStageId: '1-1', runtimeMode: 'fixed-screen' },
      { id: 'stage_battle_1_2', legacyStageId: '1-2', runtimeMode: 'fixed-screen' },
    ],
  },
  publishedCampaigns: [...LEGACY_CAMPAIGN_FALLBACK_FIXTURE.publishedCampaigns],
};
