<script setup lang="ts">
import { reactive } from "vue";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const form = reactive({
  username: "admin",
  password: "admin123",
});

async function submit() {
  try {
    await sessionStore.loginAdmin(form.username, form.password);
    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/admin-panel/index" });
    }, 600);
  } catch (error: any) {
    uni.showToast({
      title: error?.message || error?.data?.message || "登录失败",
      icon: "none",
    });
  }
}
</script>

<template>
  <view class="page-shell">
    <view class="hero-card admin-login-card">
      <text class="login-title">隐藏式管理员入口</text>
      <text class="login-subtitle">输入管理账号后进入轻量运营台。</text>
      <view class="login-form">
        <input v-model="form.username" class="login-input" placeholder="管理员账号" />
        <input
          v-model="form.password"
          class="login-input"
          password
          placeholder="管理员密码"
        />
        <button class="primary-button login-submit" @click="submit">进入管理台</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.admin-login-card {
  padding: 34rpx;
  background: linear-gradient(160deg, rgba(43, 130, 201, 0.95), rgba(21, 157, 138, 0.9));
  color: white;
}

.login-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
}

.login-subtitle {
  display: block;
  margin-top: 12rpx;
  opacity: 0.9;
}

.login-form {
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.login-input {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 22rpx;
  padding: 24rpx;
  color: white;
}

.login-submit {
  margin-top: 10rpx;
}
</style>

