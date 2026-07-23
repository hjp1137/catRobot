import { api } from './client';

export const contentApi = {
  login: (payload: { username: string; password: string }) => api.post('/auth/login', payload).then(r => r.data),
  dashboard: () => api.get('/content/dashboard').then(r => r.data),
  list: (kind: string) => api.get(`/content/${kind}`).then(r => r.data),
  get: (kind: string, id: string) => api.get(`/content/${kind}/${id}`).then(r => r.data),
  save: (kind: string, item: any) => item.rowVersion
    ? api.put(`/content/${kind}/${item.id}`, item).then(r => r.data)
    : api.post(`/content/${kind}`, item).then(r => r.data),
  clone: (kind: string, id: string, newId: string) => api.post(`/content/${kind}/${id}/clone?id=${newId}`).then(r => r.data),
  enable: (kind: string, id: string) => api.post(`/content/${kind}/${id}/enable`).then(r => r.data),
  disable: (kind: string, id: string) => api.post(`/content/${kind}/${id}/disable`).then(r => r.data),
  remove: (kind: string, id: string) => api.delete(`/content/${kind}/${id}`).then(r => r.data),
  references: (kind: string, id: string) => api.get(`/content/${kind}/${id}/references`).then(r => r.data),
  resources: (params?: Record<string, any>) => api.get('/content/resources', { params }).then(r => Array.isArray(r.data) ? r.data : (r.data?.items ?? [])),
  imageLibrary: (params?: Record<string, any>) => api.get('/content/image-library', { params }).then(r => r.data),
  imageLibraryDetail: (assetId: string) => api.get(`/content/image-library/${assetId}`).then(r => r.data),
  uploadImageLibrary: (files: File[]) => { const form = new FormData(); files.forEach(file => form.append(files.length > 1 ? 'files' : 'file', file)); return api.post(files.length > 1 ? '/content/image-library/upload-batch' : '/content/image-library/upload', form).then(r => r.data); },
  createImageVariant: (assetId: string, payload: any) => api.post(`/content/image-library/${assetId}/variants`, payload).then(r => r.data),
  batchImageVariants: (payload: any) => api.post('/content/image-library/variants/batch', payload).then(r => r.data),
  archiveImageLibrary: (assetId: string) => api.delete(`/content/image-library/${assetId}`).then(r => r.data),
  archiveImageVariant: (assetId: string, variantId: string) => api.delete(`/content/image-library/${assetId}/variants/${variantId}`).then(r => r.data),
  createVersionFromLibrary: (artKey: string, payload: any) => api.post(`/content/resources/${encodeURIComponent(artKey)}/versions/from-library`, payload).then(r => r.data),
  resource: (artKey: string) => api.get(`/content/resources/${encodeURIComponent(artKey)}`).then(r => r.data),
  createResource: (payload: any) => api.post('/content/resources', payload).then(r => r.data),
  createResourceWithVersion: (payload: any, file: File) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) if (value !== undefined && value !== null) form.append(key, String(value));
    form.append('file', file);
    return api.post('/content/resources/create-with-version', form).then(r => r.data);
  },
  updateResource: (artKey: string, payload: any) => api.put(`/content/resources/${encodeURIComponent(artKey)}`, payload).then(r => r.data),
  resourceVersions: (artKey: string) => api.get(`/content/resources/${encodeURIComponent(artKey)}/versions`).then(r => r.data),
  uploadResourceVersion: (artKey: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/content/resources/${encodeURIComponent(artKey)}/versions`, form).then(r => r.data);
  },
  selectDraftResourceVersion: (artKey: string, versionId: string) => api.post(`/content/resources/${encodeURIComponent(artKey)}/versions/${versionId}/select-draft`).then(r => r.data),
  deleteResourceVersion: (artKey: string, versionId: string) => api.delete(`/content/resources/${encodeURIComponent(artKey)}/versions/${versionId}`).then(r => r.data),
  resourcePreviewUrl: (artKey: string, versionId: string, kind = 'thumbnail') => `${api.defaults.baseURL}/content/resources/${encodeURIComponent(artKey)}/versions/${versionId}/${kind}`,
  resourceBlob: (artKey: string, versionId: string, kind = 'thumbnail') => api.get(`/content/resources/${encodeURIComponent(artKey)}/versions/${versionId}/${kind}`, { responseType: 'blob' }).then(r => URL.createObjectURL(r.data)),
  resourceBlobUrl: (url: string) => api.get(url, { responseType: 'blob' }).then(r => URL.createObjectURL(r.data)),
  animationClips: (params?: Record<string, any>) => api.get('/content/animations', { params }).then(r => r.data),
  publishedAnimationClips: () => api.get('/content/animations/published').then(r => r.data),
  animationClip: (clipKey: string) => api.get(`/content/animations/${encodeURIComponent(clipKey)}`).then(r => r.data),
  saveAnimationClip: (clip: any) => clip.rowVersion
    ? api.put(`/content/animations/${encodeURIComponent(clip.clipKey ?? clip.key)}`, clip).then(r => r.data)
    : api.post('/content/animations', clip).then(r => r.data),
  deleteAnimationClip: (clipKey: string) => api.delete(`/content/animations/${encodeURIComponent(clipKey)}`).then(r => r.data),
  animationClipReferences: (clipKey: string) => api.get(`/content/animations/${encodeURIComponent(clipKey)}/references`).then(r => r.data),
  stageOrchestration: (stageId: string) => api.get(`/content/stages/${encodeURIComponent(stageId)}/orchestration`).then(r => r.data),
  publishedStageOrchestration: (stageId: string) => api.get(`/content/stages/${encodeURIComponent(stageId)}/orchestration/published`).then(r => r.data),
  saveStageOrchestration: (stageId: string, payload: any) => api.put(`/content/stages/${encodeURIComponent(stageId)}/orchestration`, payload).then(r => r.data),
  removeStageSpawnPoint: (stageId: string, spawnPointId: string) => api.delete(`/content/stages/${encodeURIComponent(stageId)}/spawn-points/${encodeURIComponent(spawnPointId)}`).then(r => r.data),
  stageProgression: (stageId: string) => api.get(`/content/stages/${encodeURIComponent(stageId)}/progression`).then(r => r.data),
  publishedStageProgression: (stageId: string) => api.get(`/content/stages/${encodeURIComponent(stageId)}/progression/published`).then(r => r.data),
  saveStageProgression: (stageId: string, payload: any) => api.put(`/content/stages/${encodeURIComponent(stageId)}/progression`, payload).then(r => r.data),
  rewardDefinitions: () => api.get('/content/reward-definitions').then(r => r.data),
  campaigns: () => api.get('/content/campaigns').then(r => r.data),
  campaign: (id: string) => api.get(`/content/campaigns/${encodeURIComponent(id)}`).then(r => r.data),
  saveCampaign: (item: any) => item.rowVersion
    ? api.put(`/content/campaigns/${encodeURIComponent(item.id)}`, item).then(r => r.data)
    : api.post('/content/campaigns', item).then(r => r.data),
  cloneCampaign: (id: string, newId: string) => api.post(`/content/campaigns/${encodeURIComponent(id)}/clone`, { id: newId }).then(r => r.data),
  enableCampaign: (id: string, enabled: boolean, rowVersion: number) => api.post(`/content/campaigns/${encodeURIComponent(id)}/${enabled ? 'enable' : 'disable'}`, { rowVersion }).then(r => r.data),
  removeCampaign: (id: string, rowVersion: number) => api.delete(`/content/campaigns/${encodeURIComponent(id)}`, { data: { rowVersion } }).then(r => r.data),
  campaignChapters: (id: string) => api.get(`/content/campaigns/${encodeURIComponent(id)}/chapters`).then(r => r.data),
  createCampaignChapter: (id: string, item: any) => api.post(`/content/campaigns/${encodeURIComponent(id)}/chapters`, item).then(r => r.data),
  updateCampaignChapter: (id: string, item: any) => api.put(`/content/chapters/${encodeURIComponent(id)}`, item).then(r => r.data),
  cloneCampaignChapter: (id: string, newId: string) => api.post(`/content/chapters/${encodeURIComponent(id)}/clone`, { id: newId }).then(r => r.data),
  reorderCampaignChapters: (campaignId: string, items: any[]) => api.post(`/content/campaigns/${encodeURIComponent(campaignId)}/chapters/reorder`, { items }).then(r => r.data),
  enableCampaignChapter: (id: string, enabled: boolean, rowVersion: number) => api.post(`/content/chapters/${encodeURIComponent(id)}/${enabled ? 'enable' : 'disable'}`, { rowVersion }).then(r => r.data),
  removeCampaignChapter: (id: string, rowVersion: number) => api.delete(`/content/chapters/${encodeURIComponent(id)}`, { data: { rowVersion } }).then(r => r.data),
  campaignMap: (id: string) => api.get(`/content/chapters/${encodeURIComponent(id)}/map`).then(r => r.data),
  saveCampaignMap: (id: string, item: any) => api.put(`/content/chapters/${encodeURIComponent(id)}/map`, item).then(r => r.data),
  publishedCampaigns: () => api.get('/content/campaigns/published').then(r => r.data),
  tutorialFlows: () => api.get('/content/tutorials').then(r => r.data),
  tutorialFlow: (flowId: string) => api.get(`/content/tutorials/${encodeURIComponent(flowId)}`).then(r => r.data),
  createTutorialFlow: (payload: any) => api.post('/content/tutorials', payload).then(r => r.data),
  saveTutorialFlow: (flowId: string, payload: any) => api.put(`/content/tutorials/${encodeURIComponent(flowId)}`, payload).then(r => r.data),
  removeTutorialFlow: (flowId: string, rowVersion: number) => api.delete(`/content/tutorials/${encodeURIComponent(flowId)}`, { data: { rowVersion } }).then(r => r.data),
  saveTutorialOrchestration: (flowId: string, payload: any) => api.put(`/content/tutorials/${encodeURIComponent(flowId)}/orchestration`, payload).then(r => r.data),
  tutorialTargets: () => api.get('/content/tutorials/targets').then(r => r.data),
  tutorialFeatures: () => api.get('/content/tutorials/features').then(r => r.data),
  publishedTutorial: () => api.get('/content/tutorials/published').then(r => r.data),
  validate: () => api.post('/content/validate').then(r => r.data),
  publish: () => api.post('/content/publish').then(r => r.data),
  publishStatus: () => api.get('/content/publish-status').then(r => r.data),
  releases: () => api.get('/content/releases').then(r => r.data),
  restore: (id: string) => api.post(`/content/releases/${id}/restore`).then(r => r.data),
};
