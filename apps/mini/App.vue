<script lang="ts">
export default {
  onLaunch() {},
  onShow() {},
};
</script>

<style>
page {
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 30%, #ffffff 70%);
  color: #111827;
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
  background: rgba(255, 255, 255, 0.96);
  border-radius: 28rpx;
  box-shadow: 0 14rpx 36rpx rgba(148, 163, 184, 0.12);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 0 20rpx;
}

.section-title text:first-child {
  font-size: 34rpx;
  font-weight: 800;
  color: #111827;
}

.section-title text:last-child {
  color: #3b82f6;
  font-size: 24rpx;
}

.primary-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 999rpx;
}

.mini-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 22rpx;
}
</style>
