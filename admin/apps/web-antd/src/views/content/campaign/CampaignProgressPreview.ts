export type CampaignNodeState = 'LOCKED' | 'UNLOCKED' | 'CLEARED' | 'THREE_STAR' | 'NEWLY_UNLOCKED';

export class CampaignProgressPreview {
  readonly writesPlayerSave = false;
  private readonly states = new Map<string, CampaignNodeState>();

  constructor(campaign: any, preset: string) {
    const nodes = (campaign?.chapters ?? []).flatMap((chapter: any) => chapter.nodes ?? []);
    nodes.forEach((node: any) => this.states.set(node.id, 'LOCKED'));
    const first = nodes.find((node: any) => node.isStart) ?? nodes[0];
    if (!first) return;
    this.states.set(first.id, 'UNLOCKED');
    if (preset === '1-1已通关一星') {
      this.states.set(first.id, 'CLEARED'); this.unlockNext(campaign, first.id, 'NEWLY_UNLOCKED');
    }
    if (preset === '1-1已通关三星') {
      this.states.set(first.id, 'THREE_STAR'); this.unlockNext(campaign, first.id, 'NEWLY_UNLOCKED');
    }
    if (preset === '全部通关') nodes.forEach((node: any) => this.states.set(node.id, 'CLEARED'));
  }

  state(nodeId: string): CampaignNodeState { return this.states.get(nodeId) ?? 'LOCKED'; }

  private unlockNext(campaign: any, nodeId: string, state: CampaignNodeState) {
    for (const chapter of campaign?.chapters ?? []) {
      for (const edge of chapter.connections ?? []) if (edge.enabled !== false && edge.fromNodeId === nodeId) this.states.set(edge.toNodeId, state);
    }
  }
}
