<script setup lang="ts">
function copyWechat() {
  uni.setClipboardData({
    data: "yunxiaoxia_service",
    success() {
      uni.showToast({ title: "已复制微信号", icon: "success" });
    },
  });
}

function callPhone() {
  uni.makePhoneCall({ phoneNumber: "400-888-6666" });
}
</script>

<template>
  <view class="page">
    <!-- 客服头图 -->
    <view class="hero">
      <text class="hero-icon">💬</text>
      <text class="hero-title">云小夏客服中心</text>
      <text class="hero-desc">工作时间 09:00 - 22:00，节假日照常</text>
    </view>

    <!-- 联系方式 -->
    <view class="card" @click="callPhone">
      <view class="card-icon-wrap phone">
        <text class="card-icon">📞</text>
      </view>
      <view class="card-info">
        <text class="card-label">客服热线</text>
        <text class="card-value">400-888-6666</text>
      </view>
      <text class="card-arrow">›</text>
    </view>

    <view class="card" @click="copyWechat">
      <view class="card-icon-wrap wechat">
        <text class="card-icon">💚</text>
      </view>
      <view class="card-info">
        <text class="card-label">微信客服</text>
        <text class="card-value">yunxiaoxia_service</text>
      </view>
      <text class="card-arrow">›</text>
    </view>

    <!-- 常见问题 -->
    <view class="section">
      <text class="section-title">常见问题</text>

      <view class="faq-card">
        <view class="faq-item">
          <text class="faq-q">Q：租赁的桌游包含哪些配件？</text>
          <text class="faq-a">每套桌游均为完整版，包含全部卡牌、棋子、说明书等标准配件。发货前会逐一清点。</text>
        </view>
        <view class="faq-item">
          <text class="faq-q">Q：配送范围是哪些？</text>
          <text class="faq-a">目前覆盖华南大学城及周边高校，下单时可选择对应学校和宿舍楼栋。</text>
        </view>
        <view class="faq-item">
          <text class="faq-q">Q：押金什么时候退还？</text>
          <text class="faq-a">归还桌游经确认完好后，押金会在1-3个工作日内原路退回。</text>
        </view>
        <view class="faq-item">
          <text class="faq-q">Q：桌游损坏或丢失怎么办？</text>
          <text class="faq-a">轻微磨损属正常使用不收费。严重损坏或丢失需按配件价赔偿，具体请联系客服协商。</text>
        </view>
        <view class="faq-item">
          <text class="faq-q">Q：可以延长租赁天数吗？</text>
          <text class="faq-a">可以，请在到期前联系客服办理续租，按日租价格计费。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 0 24rpx 120rpx;
}

/* ── 头部 ── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 40rpx;
  gap: 12rpx;
}

.hero-icon {
  font-size: 72rpx;
  line-height: 1;
}

.hero-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #1e1e1e;
}

.hero-desc {
  font-size: 24rpx;
  color: #999;
}

/* ── 联系卡片 ── */
.card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  gap: 20rpx;
}

.card-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-wrap.phone {
  background: linear-gradient(135deg, #409eff, #4a90e2);
}

.card-icon-wrap.wechat {
  background: linear-gradient(135deg, #07c160, #26a69a);
}

.card-icon {
  font-size: 36rpx;
  line-height: 1;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.card-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e1e1e;
}

.card-value {
  font-size: 24rpx;
  color: #666;
}

.card-arrow {
  font-size: 36rpx;
  color: #ccc;
  flex-shrink: 0;
}

/* ── 常见问题 ── */
.section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e1e1e;
  display: block;
  margin-bottom: 16rpx;
  padding-left: 4rpx;
}

.faq-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.faq-item {
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-q {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 10rpx;
}

.faq-a {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}
</style>
