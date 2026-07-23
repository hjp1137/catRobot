export interface TutorialSnapshot {
  schemaVersion: 1;
  releaseId: string;
  releaseVersion: string;
  generatedAt: string;
  checksum: string;
  flowCount: number;
  stepCount: number;
  featureUnlockRuleCount: number;
  referenceSummary: {
    campaignIds: string[]; stageIds: string[]; featureIds: string[]; artKeys: string[];
    catalog: { campaignIds: string[]; stageIds: string[]; featureIds: string[]; artKeys: string[] };
  };
  flows: TutorialFlowDefinition[];
}

export interface TutorialFlowDefinition {
  id: string;
  name: string;
  description: string;
  campaignId: string | null;
  startStepId: string;
  endStepId: string | null;
  enabled: boolean;
  steps: TutorialStepDefinition[];
  transitions: TutorialTransitionDefinition[];
  unlockRules: TutorialUnlockRuleDefinition[];
  [key: string]: unknown;
}

export interface TutorialStepDefinition {
  id: string;
  order: number;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  displayType: string;
  targetType: string;
  targetId: string;
  title: string;
  body: string;
  blockInput: boolean;
  force: boolean;
  completionType: string;
  completionConfig: Record<string, unknown>;
  timeoutMs: number | null;
  fallbackAction: string | null;
  nextStepId: string | null;
  skipStepId: string | null;
  terminal: boolean;
  [key: string]: unknown;
}

export interface TutorialTransitionDefinition {
  id: string; fromStepId: string; toStepId: string; conditionType: string;
  condition: Record<string, unknown>; order: number; enabled: boolean; [key: string]: unknown;
}

export interface TutorialUnlockRuleDefinition {
  id: string; stepId?: string; featureId: string; unlockTrigger: string;
  condition: Record<string, unknown>; unlockOnSkip: boolean; order: number; enabled: boolean; [key: string]: unknown;
}
