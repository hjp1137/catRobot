import { describe, expect, it } from 'vitest';
import { CampaignProgressPreview } from './CampaignProgressPreview';

const campaign = {
  chapters: [{ id: 'chapter_1', nodes: [
    { id: 'node_1', stageId: 'stage_1', isStart: true },
    { id: 'node_2', stageId: 'stage_2' },
    { id: 'node_3', stageId: 'stage_3', isEnd: true },
  ], connections: [
    { fromNodeId: 'node_1', toNodeId: 'node_2', enabled: true },
    { fromNodeId: 'node_2', toNodeId: 'node_3', enabled: true },
  ] }],
};

describe('CampaignProgressPreview', () => {
  it.each([
    ['全部未通关', 'node_1', 'UNLOCKED'],
    ['仅起点解锁', 'node_2', 'LOCKED'],
    ['1-1已通关一星', 'node_1', 'CLEARED'],
    ['1-1已通关三星', 'node_1', 'THREE_STAR'],
    ['全部通关', 'node_3', 'CLEARED'],
  ])('supports preset %s', (preset, nodeId, state) => {
    const preview = new CampaignProgressPreview(campaign as any, preset);
    expect(preview.state(nodeId)).toBe(state);
    expect(preview.writesPlayerSave).toBe(false);
  });
});
