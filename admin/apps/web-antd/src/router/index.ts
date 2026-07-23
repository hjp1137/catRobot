import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/content/LoginView.vue';
import DashboardView from '../views/content/DashboardView.vue';
import EntityListView from '../views/content/EntityListView.vue';
import ResourcesView from '../views/content/ResourcesView.vue';
import ImageLibraryView from '../views/content/ImageLibraryView.vue';
import PublishView from '../views/content/PublishView.vue';
import AnimationClipsView from '../views/content/AnimationClipsView.vue';
import StageOrchestrationEditor from '../views/content/StageOrchestrationEditor.vue';
import CampaignListView from '../views/content/CampaignListView.vue';
import CampaignChaptersView from '../views/content/CampaignChaptersView.vue';
import CampaignMapEditor from '../views/content/CampaignMapEditor.vue';
import TutorialFlowListView from '../views/content/TutorialFlowListView.vue';
import TutorialFlowEditor from '../views/content/TutorialFlowEditor.vue';
export { menuItems } from './menu';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/content/dashboard' },
    { path: '/login', component: LoginView },
    { path: '/content/dashboard', component: DashboardView },
    { path: '/content/resources', component: ResourcesView },
    { path: '/content/image-library', component: ImageLibraryView },
    { path: '/content/animations', component: AnimationClipsView },
    { path: '/content/stages/:stageId/editor', component: StageOrchestrationEditor },
    { path: '/content/campaigns', component: CampaignListView },
    { path: '/content/campaigns/:campaignId/chapters', component: CampaignChaptersView },
    { path: '/content/chapters/:chapterId/map', component: CampaignMapEditor },
    { path: '/content/tutorials', component: TutorialFlowListView },
    { path: '/content/tutorials/:flowId/editor', component: TutorialFlowEditor },
    { path: '/content/publish', component: PublishView },
    { path: '/content/:kind', component: EntityListView },
  ],
});
