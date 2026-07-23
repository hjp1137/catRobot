import { defineStore } from 'pinia';
import { contentApi } from '../api/content';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('cat_robot_token') ?? '',
    profile: null as null | { username: string; role: string },
  }),
  actions: {
    async login(username: string, password: string) {
      const data = await contentApi.login({ username, password });
      this.token = data.accessToken;
      this.profile = data.profile;
      localStorage.setItem('cat_robot_token', data.accessToken);
    },
    logout() {
      this.token = '';
      this.profile = null;
      localStorage.removeItem('cat_robot_token');
    },
  },
});
