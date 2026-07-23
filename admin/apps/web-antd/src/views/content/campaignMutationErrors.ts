export function campaignMutationErrorMessage(error: any): string | undefined {
  const detail = error?.response?.data;
  if (detail?.code === 'CONTENT_CONFLICT') {
    const local = detail.localRowVersion ?? '?';
    const remote = detail.remoteRowVersion ?? '?';
    return `数据已被其他用户修改（本地 v${local}，远程 v${remote}），请刷新后重试。`;
  }
  if (detail?.code === 'CONTENT_REFERENCE_EXISTS') {
    return '当前数据仍被其他内容引用，解除引用后才能删除。';
  }
  return undefined;
}

export async function runCampaignMutation(
  mutation: () => Promise<unknown>,
  notify: (message: string) => void,
  afterSuccess?: () => void | Promise<void>,
  notifyRefreshError?: (message: string) => void,
): Promise<boolean> {
  try {
    await mutation();
  } catch (error) {
    notify(campaignMutationErrorMessage(error) ?? '请求失败，请稍后重试。');
    return false;
  }
  try {
    await afterSuccess?.();
  } catch {
    (notifyRefreshError ?? notify)('数据已保存，但刷新失败，请手动刷新页面。');
  }
  return true;
}
