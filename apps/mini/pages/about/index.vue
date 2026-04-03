<script setup lang="ts">
const version = "1.0.0";

const features = [
  { icon: "🎲", title: "桌游精选", desc: "严选百款热门桌游，聚会、策略、双人局应有尽有" },
  { icon: "🚀", title: "极速配送", desc: "大学城内当日送达，宿舍楼下取货超方便" },
  { icon: "💰", title: "经济实惠", desc: "按天计费，低至几元/天，比买更划算" },
  { icon: "🛡️", title: "品质保障", desc: "每套桌游发货前全面清点消毒，安心使用" },
];

const timeline = [
  { year: "2024", event: "云小夏桌游租赁成立，从校园社团发展而来" },
  { year: "2025", event: "覆盖华南大学城3所高校，用户突破2000+" },
  { year: "2026", event: "小程序2.0上线，新增线上下单+配送到寝" },
];
</script>

<template>
  <view class="page">
    <!-- 品牌头部 -->
    <view class="brand-hero">
      <text class="brand-icon">🎯</text>
      <text class="brand-name">云小夏桌游租赁</text>
      <text class="brand-slogan">大学城桌游上门，青春聚会轻松开场</text>
      <text class="brand-version">v{{ version }}</text>
    </view>

    <!-- 特色服务 -->
    <view class="section">
      <text class="section-title">我们的特色</text>
      <view class="features">
        <view v-for="f in features" :key="f.title" class="feature-item">
          <text class="feature-icon">{{ f.icon }}</text>
          <view class="feature-text">
            <text class="feature-title">{{ f.title }}</text>
            <text class="feature-desc">{{ f.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发展历程 -->
    <view class="section">
      <text class="section-title">发展历程</text>
      <view class="timeline-card">
        <view v-for="(t, i) in timeline" :key="i" class="timeline-item">
          <view class="timeline-dot"></view>
          <view class="timeline-content">
            <text class="timeline-year">{{ t.year }}</text>
            <text class="timeline-event">{{ t.event }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系信息 -->
    <view class="section">
      <text class="section-title">联系我们</text>
      <view class="contact-card">
        <view class="contact-row">
          <text class="contact-label">客服热线</text>
          <text class="contact-value">400-888-6666</text>
        </view>
        <view class="contact-row">
          <text class="contact-label">微信客服</text>
          <text class="contact-value">yunxiaoxia_service</text>
        </view>
        <view class="contact-row">
          <text class="contact-label">服务区域</text>
          <text class="contact-value">华南大学城及周边高校</text>
        </view>
        <view class="contact-row">
          <text class="contact-label">工作时间</text>
          <text class="contact-value">每天 09:00 - 22:00</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">© 2024-2026 云小夏桌游租赁 保留所有权利</text>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 0 24rpx 120rpx;
}

/* ── 品牌头部 ── */
.brand-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 0 40rpx;
  gap: 12rpx;
}

.brand-icon {
  font-size: 80rpx;
  line-height: 1;
}

.brand-name {
  font-size: 38rpx;
  font-weight: 800;
  color: #1e1e1e;
}

.brand-slogan {
  font-size: 24rpx;
  color: #999;
}

.brand-version {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #bbb;
  background: #eee;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
}

/* ── 通用区块 ── */
.section {
  margin-top: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e1e1e;
  display: block;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

/* ── 特色服务 ── */
.features {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 40rpx;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.feature-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e1e1e;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

/* ── 发展历程 ── */
.timeline-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 28rpx 10rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.timeline-item {
  display: flex;
  gap: 20rpx;
  padding-bottom: 28rpx;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 11rpx;
  top: 30rpx;
  width: 2rpx;
  bottom: 0;
  background: #e0e0e0;
}

.timeline-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #159d8a;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.timeline-year {
  font-size: 26rpx;
  font-weight: 800;
  color: #159d8a;
}

.timeline-event {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

/* ── 联系信息 ── */
.contact-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.contact-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.contact-row:last-child {
  border-bottom: none;
}

.contact-label {
  font-size: 26rpx;
  color: #999;
}

.contact-value {
  font-size: 26rpx;
  color: #1e1e1e;
  font-weight: 600;
}

/* ── 底部 ── */
.footer {
  margin-top: 60rpx;
  text-align: center;
}

.footer-text {
  font-size: 22rpx;
  color: #ccc;
}
</style>
