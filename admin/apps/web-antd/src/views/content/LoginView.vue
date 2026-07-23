<template>
  <a-card title="管理员登录" class="login-card">
    <a-form :model="form" layout="vertical" @finish="submit">
      <a-form-item label="用户名" name="username" :rules="[{ required: true }]">
        <a-input v-model:value="form.username" />
      </a-form-item>
      <a-form-item label="密码" name="password" :rules="[{ required: true, min: 8 }]">
        <a-input-password v-model:value="form.password" />
      </a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">登录</a-button>
    </a-form>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../../store/auth';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function submit() {
  loading.value = true;
  try {
    await auth.login(form.username, form.password);
    router.push('/content/dashboard');
  } catch (error) {
    message.error('登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-card {
  max-width: 380px;
}
</style>
