<template>
  <view></view>
</template>

<script setup lang="ts"></script>

<style>
page {
  background:
    radial-gradient(circle at top left, rgba(43, 130, 201, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(75, 214, 191, 0.16), transparent 34%),
    linear-gradient(180deg, #effdfa 0%, #eef7ff 100%);
  color: #173b3a;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

view,
text,
button {
  box-sizing: border-box;
}

.page-shell {
  padding: 28rpx;
}

.hero-card,
.panel-card,
.game-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 36rpx;
  box-shadow: 0 18rpx 50rpx rgba(23, 89, 101, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 0 20rpx;
}

.section-title text:first-child {
  font-size: 34rpx;
  font-weight: 700;
}

.section-title text:last-child {
  color: #159d8a;
  font-size: 24rpx;
}

.primary-button {
  background: linear-gradient(135deg, #2b82c9, #159d8a);
  color: white;
  border-radius: 999rpx;
}

.mini-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(21, 157, 138, 0.1);
  color: #159d8a;
  font-size: 22rpx;
}
</style>
