import { describe, expect, it, vi } from 'vitest';
import { campaignMutationErrorMessage, runCampaignMutation } from './campaignMutationErrors';

describe('campaignMutationErrorMessage', () => {
  it('maps rowVersion conflicts to an actionable refresh message', () => {
    expect(campaignMutationErrorMessage({ response: { data: {
      code: 'CONTENT_CONFLICT', localRowVersion: 2, remoteRowVersion: 3,
    } } })).toBe('数据已被其他用户修改（本地 v2，远程 v3），请刷新后重试。');
  });

  it('maps reference conflicts to an actionable delete message', () => {
    expect(campaignMutationErrorMessage({ response: { data: {
      code: 'CONTENT_REFERENCE_EXISTS', references: [{ entity: 'campaignDefaultChapter' }],
    } } })).toBe('当前数据仍被其他内容引用，解除引用后才能删除。');
  });

  it('does not disguise unknown request failures as business conflicts', () => {
    expect(campaignMutationErrorMessage(new Error('network'))).toBeUndefined();
  });

  it.each([
    [{ code: 'CONTENT_CONFLICT', localRowVersion: 2, remoteRowVersion: 3 },
      '数据已被其他用户修改（本地 v2，远程 v3），请刷新后重试。'],
    [{ code: 'CONTENT_REFERENCE_EXISTS' },
      '当前数据仍被其他内容引用，解除引用后才能删除。'],
  ])('executes a rejecting mutation and reports its structured error', async (data, expected) => {
    const notify = vi.fn(); const reload = vi.fn();

    const ok = await runCampaignMutation(
      () => Promise.reject({ response: { data } }), notify, reload,
    );

    expect(ok).toBe(false);
    expect(notify).toHaveBeenCalledWith(expected);
    expect(reload).not.toHaveBeenCalled();
  });

  it('keeps a successful mutation successful when refresh fails', async () => {
    const notifyMutation = vi.fn(); const notifyRefresh = vi.fn();

    const ok = await runCampaignMutation(
      () => Promise.resolve(), notifyMutation,
      () => Promise.reject(new Error('reload unavailable')), notifyRefresh,
    );

    expect(ok).toBe(true);
    expect(notifyMutation).not.toHaveBeenCalled();
    expect(notifyRefresh).toHaveBeenCalledWith('数据已保存，但刷新失败，请手动刷新页面。');
  });
});
