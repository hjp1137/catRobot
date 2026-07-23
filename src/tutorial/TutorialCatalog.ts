export interface TutorialFeature {
  id: string;
  name: string;
  unlockNotice: string;
  safeOnSkip: boolean;
  defaultUnlocked: boolean;
}

export type TutorialStaticTarget = readonly ['ui' | 'canvas', string, string];

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value as object)) deepFreeze(item);
  }
  return value;
}

export const TUTORIAL_FEATURES = deepFreeze<TutorialFeature[]>([
  { id: 'feature.campaign', name: '主线战役', unlockNotice: '主线战役已解锁', safeOnSkip: true, defaultUnlocked: true },
  { id: 'feature.inventory', name: '背包', unlockNotice: '背包已解锁', safeOnSkip: true, defaultUnlocked: false },
  { id: 'feature.equipment', name: '装备', unlockNotice: '装备舱已解锁', safeOnSkip: true, defaultUnlocked: false },
  { id: 'feature.skills', name: '技能', unlockNotice: '技能养成已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.runes', name: '符文', unlockNotice: '符文系统已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.strengthen', name: '强化', unlockNotice: '装备强化已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.decompose', name: '装备分解', unlockNotice: '装备分解已解锁', safeOnSkip: false, defaultUnlocked: false },
  { id: 'feature.exploration', name: '自由探索', unlockNotice: '自由探索已解锁', safeOnSkip: false, defaultUnlocked: false },
]);

export const TUTORIAL_STATIC_TARGETS = deepFreeze<TutorialStaticTarget[]>([
  ['ui', 'home.campaign', '主线战役入口'], ['ui', 'campaign.chapter.1', '第一章'], ['ui', 'campaign.stage.1-1', '1-1节点'],
  ['ui', 'stage.detail.objective', '关卡目标'], ['ui', 'stage.detail.power', '推荐战力'], ['ui', 'stage.detail.reward', '关卡奖励'],
  ['ui', 'stage.detail.start', '开始关卡'], ['ui', 'result.stars', '结算星级'], ['ui', 'result.reward', '结算奖励'],
  ['ui', 'result.continue', '返回地图'], ['ui', 'campaign.new-node', '新节点'], ['ui', 'campaign.back', '章节地图返回'],
  ['ui', 'home.inventory', '背包入口'], ['ui', 'equipment.inventory.first', '首件背包装备'], ['ui', 'home.equipment', '装备入口'],
  ['canvas', 'battle.move-zone', '移动区域'], ['canvas', 'battle.attack', '攻击按钮'], ['canvas', 'battle.enemy', '首个敌人'],
  ['canvas', 'battle.wave', '首波敌人'], ['canvas', 'battle.clear', '关卡完成'],
]);
