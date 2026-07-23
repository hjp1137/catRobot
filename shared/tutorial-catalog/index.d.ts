export type TutorialFeatureDefinition = Readonly<{
  id: string; name: string; unlockNotice: string; safeOnSkip: boolean; defaultUnlocked: boolean;
}>;
export type TutorialStaticTargetDefinition = readonly [type: 'ui' | 'canvas', id: string, name: string];
export const TUTORIAL_FEATURES: readonly TutorialFeatureDefinition[];
export const TUTORIAL_STATIC_TARGETS: readonly TutorialStaticTargetDefinition[];
export const TUTORIAL_TRIGGERS: readonly string[];
export const TUTORIAL_COMPLETIONS: readonly string[];
