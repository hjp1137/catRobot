'use strict';

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

const TUTORIAL_FEATURES = deepFreeze([
  { id: 'feature.campaign', name: '主线战役', unlockNotice: '主线战役已解锁', safeOnSkip: true, defaultUnlocked: true },
  { id: 'feature.inventory', name: '背包', unlockNotice: '背包已解锁', safeOnSkip: true, defaultUnlocked: false },
  { id: 'feature.equipment', name: '装备', unlockNotice: '装备舱已解锁', safeOnSkip: true, defaultUnlocked: false },
  { id: 'feature.skills', name: '技能', unlockNotice: '技能养成已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.runes', name: '符文', unlockNotice: '符文系统已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.strengthen', name: '强化', unlockNotice: '装备强化已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.decompose', name: '装备分解', unlockNotice: '装备分解已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.exploration', name: '自由探索', unlockNotice: '自由探索已解锁', safeOnSkip: false, defaultUnlocked: false },
]);
const TUTORIAL_STATIC_TARGETS = deepFreeze([
  ['ui', 'home.campaign', '主线战役入口'], ['ui', 'campaign.chapter.1', '第一章'], ['ui', 'campaign.stage.1-1', '1-1节点'],
  ['ui', 'stage.detail.objective', '关卡目标'], ['ui', 'stage.detail.power', '推荐战力'], ['ui', 'stage.detail.reward', '关卡奖励'],
  ['ui', 'stage.detail.start', '开始关卡'], ['ui', 'result.stars', '结算星级'], ['ui', 'result.reward', '结算奖励'],
  ['ui', 'result.continue', '返回地图'], ['ui', 'campaign.new-node', '新节点'], ['ui', 'campaign.back', '章节地图返回'],
  ['ui', 'home.inventory', '背包入口'], ['ui', 'equipment.inventory.first', '首件背包装备'], ['ui', 'home.equipment', '装备入口'],
  ['canvas', 'battle.move-zone', '移动区域'], ['canvas', 'battle.attack', '攻击按钮'], ['canvas', 'battle.enemy', '首个敌人'],
  ['canvas', 'battle.wave', '首波敌人'], ['canvas', 'battle.clear', '关卡完成'],
]);
const TUTORIAL_TRIGGERS = deepFreeze(['app.ready', 'page.home', 'page.campaign', 'page.stage-detail', 'detail.objective-viewed',
  'detail.power-viewed', 'detail.reward-viewed', 'battle.ready', 'battle.player-moved', 'battle.attack-used', 'battle.enemy-defeated',
  'battle.wave-cleared', 'page.result', 'result.stars-viewed', 'reward.claimed', 'campaign.node-unlocked', 'page.inventory',
  'equipment.equipped', 'page.enter', 'app-first-launch', 'campaign-page-opened', 'chapter-map-opened', 'stage-detail-opened',
  'stage-started', 'player-moved', 'player-attacked', 'enemy-defeated', 'wave-cleared', 'stage-cleared', 'settlement-opened',
  'reward-granted', 'equipment-page-opened', 'equipment-equipped', 'rune-page-opened', 'tutorial-step-completed']);
const TUTORIAL_COMPLETIONS = deepFreeze(['dialog.acknowledged', 'target.clicked', 'node.clicked', 'detail.objective-viewed',
  'detail.power-viewed', 'detail.reward-viewed', 'stage.started', 'battle.player-moved', 'battle.attack-used', 'battle.enemy-defeated',
  'battle.wave-cleared', 'stage.cleared', 'result.stars-viewed', 'reward.claimed', 'campaign.returned', 'campaign.node-unlocked',
  'page.inventory', 'equipment.equipped', 'target.click', 'stage-started', 'player-moved', 'player-attacked', 'enemy-defeated',
  'wave-cleared', 'stage-cleared', 'reward-granted', 'equipment-equipped', 'tutorial-step-completed']);

module.exports = { TUTORIAL_FEATURES, TUTORIAL_STATIC_TARGETS, TUTORIAL_TRIGGERS, TUTORIAL_COMPLETIONS };
