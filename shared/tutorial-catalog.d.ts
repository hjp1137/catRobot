export interface TutorialFeature {
  id: string;
  name: string;
  unlockNotice: string;
  safeOnSkip: boolean;
  defaultUnlocked: boolean;
}

export type TutorialStaticTarget = readonly ['ui' | 'canvas', string, string];

export const TUTORIAL_FEATURES: readonly TutorialFeature[];
export const TUTORIAL_STATIC_TARGETS: readonly TutorialStaticTarget[];
export const TUTORIAL_TRIGGERS: readonly string[];
export const TUTORIAL_COMPLETIONS: readonly string[];
