import { BadRequestException } from '@nestjs/common';

export async function lockTutorialSources(tx: any, body: any) {
  const campaigns = new Set<string>(); const stages = new Set<string>(); const art = new Set<string>();
  if (body.flow?.campaignId) campaigns.add(body.flow.campaignId);
  for (const step of body.steps ?? []) {
    if (step.campaignId) campaigns.add(step.campaignId);
    if (step.stageId) stages.add(step.stageId);
    if (step.avatarArtKey) art.add(step.avatarArtKey);
    if (step.targetType === 'campaign') campaigns.add(step.targetId);
    if (step.targetType === 'stage') stages.add(step.targetId);
    if (step.targetType === 'art') art.add(step.targetId);
  }
  for (const rule of body.unlockRules ?? []) if (rule.stageId) stages.add(rule.stageId);
  await lockMany(tx.contentCampaign, 'id', campaigns, 'TUTORIAL_CAMPAIGN_REFERENCE_INVALID');
  await lockMany(tx.contentStage, 'id', stages, 'TUTORIAL_STAGE_REFERENCE_INVALID');
  await lockMany(tx.contentArtResource, 'art_key', art, 'TUTORIAL_ART_REFERENCE_INVALID');
}

export async function lockTutorialStepSources(tx: any, step: any) {
  await lockTutorialSources(tx, { flow: { campaignId: null }, steps: [step], unlockRules: [] });
}

async function lockMany(delegate: any, field: string, values: Set<string>, code: string) {
  for (const value of [...values].sort()) {
    const changed = await delegate.updateMany({ where: { [field]: value, deleted_at: null },
      data: { row_version: { increment: 0 } } });
    if (changed.count !== 1) throw new BadRequestException({ code, reference: { [field]: value } });
  }
}
