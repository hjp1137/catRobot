const FLOW_ID = 'tutorial.main.firstJourney';
const CAMPAIGN_ID = 'campaign_main_01';
const STAGE_ID = 'stage_battle_1_1';
const AVATAR_ART_KEY = 'player.mechaCat.idle';
const ARROW_ART_KEY = 'ui.tutorial.arrow';
const ART_KEYS = [AVATAR_ART_KEY, ARROW_ART_KEY];

export async function seedTutorialDraft(db: any): Promise<'created' | 'restored' | 'skipped'> {
  const existing = await db.contentTutorialFlow.findUnique({ where: { id: FLOW_ID } });
  const [campaign, stage, art] = await Promise.all([
    db.contentCampaign.findUnique({ where: { id: CAMPAIGN_ID } }),
    db.contentStage.findUnique({ where: { id: STAGE_ID } }),
    db.contentArtResource.findMany({ where: { art_key: { in: ART_KEYS }, enabled: true, deleted_at: null },
      include: { currentDraftVersion: true, publishedVersion: true } }),
  ]);
  if (!campaign || campaign.deleted_at || !campaign.enabled) throw new Error(`tutorial seed campaign invalid: ${CAMPAIGN_ID}`);
  if (!stage || stage.deleted_at || !stage.enabled) throw new Error(`tutorial seed stage invalid: ${STAGE_ID}`);
  const found = new Set(art.filter((row: any) => row.enabled !== false && !row.deleted_at &&
    !['missing', 'invalid'].includes(row.resource_status) && validArtVersion(row)).map((row: any) => row.art_key));
  const missing = ART_KEYS.filter(key => !found.has(key));
  if (missing.length) throw new Error(`tutorial seed art missing: ${missing.join(',')}`);
  let repaired = false;
  await db.$transaction(async (tx: any) => {
    const flow = { name: '首次旅程', description: '从主线入口到首关结算与装备解锁的默认草稿。',
      campaign_id: CAMPAIGN_ID, start_step_id: 'tutorial.welcome', end_step_id: 'tutorial.complete',
      start_condition_json: { type: 'first-login' }, audience_json: { player: 'new' }, player_condition_json: {},
      skip_unlock_features_json: ['feature.campaign', 'feature.inventory', 'feature.equipment'],
      skippable: true, allow_replay: true, priority: 100, enabled: true, schema_version: 1, content_version: 1 };
    if (existing?.deleted_at) {
      const changed = await tx.contentTutorialFlow.updateMany({ where: { id: FLOW_ID, row_version: existing.row_version },
        data: { ...flow, deleted_at: null, row_version: { increment: 1 } } });
      if (changed.count !== 1) throw new Error(`tutorial seed conflict: ${FLOW_ID}`);
      repaired = true;
    } else if (!existing) await tx.contentTutorialFlow.create({ data: { id: FLOW_ID, ...flow } });
    for (const row of defaultSteps()) repaired = await restoreOrCreate(tx.contentTutorialStep, row) || repaired;
    for (const row of [
      rule('tutorial.unlock.campaign', 'tutorial.openCampaign', 'feature.campaign', 1),
      rule('tutorial.unlock.equipment', 'tutorial.resultReward', 'feature.equipment', 2),
      rule('tutorial.unlock.inventory', 'tutorial.resultReward', 'feature.inventory', 3),
      rule('tutorial.unlock.skills', 'tutorial.complete', 'feature.skills', 4),
      rule('tutorial.unlock.runes', 'tutorial.complete', 'feature.runes', 5),
      rule('tutorial.unlock.strengthen', 'tutorial.complete', 'feature.strengthen', 6),
      rule('tutorial.unlock.decompose', 'tutorial.complete', 'feature.decompose', 7),
      rule('tutorial.unlock.exploration', 'tutorial.complete', 'feature.exploration', 8),
    ]) repaired = await restoreOrCreate(tx.contentFeatureUnlockRule, row) || repaired;
    if (!existing || repaired) {
      await tx.contentSystemState.upsert({ where: { id: 'singleton' },
        create: { id: 'singleton', draft_revision: 1, draft_dirty: true },
        update: { draft_revision: { increment: 1 }, draft_dirty: true } });
      await tx.contentChangeLog.create({ data: { entity_type: 'tutorial-flow', entity_id: FLOW_ID,
        action_type: repaired ? 'restore-tutorial-draft' : 'seed-tutorial-draft',
        after_json: { stepCount: defaultSteps().length, releasePublished: false } } });
    }
  });
  return existing ? repaired ? 'restored' : 'skipped' : 'created';
}

function validArtVersion(row: any) {
  const version = row.currentDraftVersion ?? row.publishedVersion;
  if (!version) return row.resource_status === 'virtual' || row.resource_status === 'fallback';
  return ['valid', 'warning', 'published'].includes(version.validation_status) && !!version.checksum;
}

async function restoreOrCreate(delegate: any, data: any) {
  const current = await delegate.findUnique({ where: { id: data.id } });
  if (!current) { await delegate.create({ data }); return true; }
  if (!current.deleted_at) return false;
  const { id, row_version, ...next } = data;
  const changed = await delegate.updateMany({ where: { id, row_version: current.row_version },
    data: { ...next, enabled: true, deleted_at: null, row_version: { increment: 1 } } });
  if (changed.count !== 1) throw new Error(`tutorial seed conflict: ${id}`);
  return true;
}

export function defaultSteps() {
  const base = { flow_id: FLOW_ID, trigger_json: {}, display_type: 'dialog', character_name: '喵喵教官',
    mask_json: { opacity: 0.68, padding: 12 }, arrow_json: { artKey: ARROW_ART_KEY, direction: 'auto' }, completion_json: {},
    timeout_ms: 8000, fallback_action: 'skip-step', enabled: true, row_version: 1 };
  const step = (id: string, order: number, targetType: string, targetId: string, title: string, body: string,
    avatar: string, next: string | null, terminal = false, block = true) => ({ ...base, id, sort_order: order,
    name: title, trigger_type: 'page.enter', target_type: targetType, target_id: targetId, title, body,
    avatar_art_key: avatar, block_input: block, completion_type: 'target.click', next_step_id: next,
    skip_step_id: null, stage_id: targetType === 'stage' || targetType === 'canvas' ? STAGE_ID : null,
    feature_id: null, terminal, content_version: 1 });
  const rows = [
    step('tutorial.welcome', 1, 'ui', 'home.campaign', '欢迎驾驶员', '先打开主线战役。', AVATAR_ART_KEY, 'tutorial.openCampaign'),
    step('tutorial.openCampaign', 2, 'ui', 'campaign.chapter.1', '主线入口', '进入第一章。', AVATAR_ART_KEY, 'tutorial.chapterOne'),
    step('tutorial.chapterOne', 3, 'ui', 'campaign.stage.1-1', '选择1-1', '选择铸造通道。', AVATAR_ART_KEY, 'tutorial.stageDetail'),
    step('tutorial.stageDetail', 4, 'ui', 'stage.detail.objective', '关卡目标', '查看本关目标。', AVATAR_ART_KEY, 'tutorial.stagePower'),
    step('tutorial.stagePower', 5, 'ui', 'stage.detail.power', '推荐战力', '确认推荐战力。', AVATAR_ART_KEY, 'tutorial.stageReward'),
    step('tutorial.stageReward', 6, 'ui', 'stage.detail.reward', '关卡奖励', '查看通关奖励。', AVATAR_ART_KEY, 'tutorial.startStage'),
    step('tutorial.startStage', 7, 'ui', 'stage.detail.start', '开始关卡', '启动机甲。', AVATAR_ART_KEY, 'tutorial.move'),
    step('tutorial.move', 8, 'canvas', 'battle.move-zone', '移动教学', '拖动机甲。', AVATAR_ART_KEY, 'tutorial.attack'),
    step('tutorial.attack', 9, 'canvas', 'battle.attack', '攻击教学', '点击攻击。', AVATAR_ART_KEY, 'tutorial.firstEnemy'),
    step('tutorial.firstEnemy', 10, 'canvas', 'battle.enemy', '首个敌人', '击败首个敌人。', AVATAR_ART_KEY, 'tutorial.firstWave'),
    step('tutorial.firstWave', 11, 'canvas', 'battle.wave', '首波教学', '清除首波。', AVATAR_ART_KEY, 'tutorial.clear'),
    step('tutorial.clear', 12, 'canvas', 'battle.clear', '完成关卡', '完成剩余战斗。', AVATAR_ART_KEY, 'tutorial.resultStars'),
    step('tutorial.resultStars', 13, 'ui', 'result.stars', '结算星级', '查看本次星级。', AVATAR_ART_KEY, 'tutorial.resultReward'),
    step('tutorial.resultReward', 14, 'ui', 'result.reward', '领取奖励', '首通奖励只发一次。', AVATAR_ART_KEY, 'tutorial.returnMap'),
    step('tutorial.returnMap', 15, 'ui', 'result.continue', '返回地图', '返回第一章地图。', AVATAR_ART_KEY, 'tutorial.newNode'),
    step('tutorial.newNode', 16, 'ui', 'campaign.new-node', '新节点解锁', '查看新解锁节点。', AVATAR_ART_KEY, 'tutorial.inventory'),
    step('tutorial.inventory', 17, 'ui', 'campaign.back', '返回车库', '返回已解锁功能。', AVATAR_ART_KEY, 'tutorial.equipment'),
    step('tutorial.equipment', 18, 'ui', 'home.equipment', '装备已解锁', '打开装备舱。', AVATAR_ART_KEY, 'tutorial.complete'),
    step('tutorial.complete', 19, 'ui', 'equipment.inventory.first', '教学完成', '选择并穿戴首件战利品。', AVATAR_ART_KEY, null, true, false),
  ];
  const semantics: Record<string, [string, string]> = {
    'tutorial.welcome': ['app.ready', 'dialog.acknowledged'],
    'tutorial.openCampaign': ['page.campaign', 'target.clicked'], 'tutorial.chapterOne': ['page.campaign', 'node.clicked'],
    'tutorial.stageDetail': ['page.stage-detail', 'detail.objective-viewed'],
    'tutorial.stagePower': ['detail.objective-viewed', 'detail.power-viewed'],
    'tutorial.stageReward': ['detail.power-viewed', 'detail.reward-viewed'],
    'tutorial.startStage': ['detail.reward-viewed', 'stage.started'],
    'tutorial.move': ['battle.ready', 'battle.player-moved'], 'tutorial.attack': ['battle.player-moved', 'battle.attack-used'],
    'tutorial.firstEnemy': ['battle.attack-used', 'battle.enemy-defeated'],
    'tutorial.firstWave': ['battle.enemy-defeated', 'battle.wave-cleared'],
    'tutorial.clear': ['battle.wave-cleared', 'stage.cleared'], 'tutorial.resultStars': ['page.result', 'result.stars-viewed'],
    'tutorial.resultReward': ['result.stars-viewed', 'reward.claimed'],
    'tutorial.returnMap': ['reward.claimed', 'campaign.returned'], 'tutorial.newNode': ['page.campaign', 'campaign.node-unlocked'],
    'tutorial.inventory': ['page.campaign', 'target.clicked'],
    'tutorial.equipment': ['page.home', 'target.clicked'],
    'tutorial.complete': ['page.inventory', 'equipment.equipped'],
  };
  return rows.map(row => ({ ...row, trigger_type: semantics[row.id][0],
    trigger_json: { event: semantics[row.id][0] }, completion_type: semantics[row.id][1],
    completion_json: { event: semantics[row.id][1] } }));
}

function rule(id: string, stepId: string, featureId: string, order: number) {
  return { id, flow_id: FLOW_ID, step_id: stepId, feature_id: featureId, unlock_trigger: 'step.complete',
    condition_json: {}, unlock_on_skip: true, sort_order: order, enabled: true, row_version: 1 };
}
