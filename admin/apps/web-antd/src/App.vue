<template>
  <a-layout class="shell">
    <a-layout-sider class="side" :width="232">
      <div class="brand">喵喵机甲内容管理</div>
      <a-menu theme="light" mode="inline" :selected-keys="[route.path]" @click="go">
        <a-menu-item v-for="item in menuItems" :key="item.path">{{ item.label }}</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="top light-header">
        <span>{{ route.meta.title ?? 'Content Admin' }}</span>
        <a-button v-if="auth.token" size="small" @click="auth.logout()">退出</a-button>
        <a-button v-else size="small" type="primary" @click="router.push('/login')">登录</a-button>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { menuItems } from './router/menu';
import { useAuthStore } from './store/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
function go(event: { key: string }) {
  router.push(event.key);
}
</script>
