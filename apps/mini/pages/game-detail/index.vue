<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { request } from "../../api";

const game = ref<any>(null);

onLoad(async (query) => {
  const id = String(query?.id || "");
  game.value = await request(`/app/games/${id}`);
});

function bookNow() {
  uni.navigateTo({
    url: `/pages/order-create/index?gameId=${game.value.id}`,
  });
}
</script>

<template>
  <view v-if="game" class="page-shell">
    <swiper autoplay circular class="detail-swiper">
      <swiper-item v-for="image in game.gallery" :key="image">
        <image :src="image" class="detail-image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <view class="hero-card detail-card">
      <view class="detail-head">
        <view>
          <text class="detail-title">{{ game.name }}</text>
          <text class="detail-category">{{ game.categoryName }}</text>
        </view>
        <text class="detail-price">¥{{ game.dailyPrice }}/天</text>
      </view>
      <view class="tag-row">
        <text v-for="tag in game.tags" :key="tag" class="mini-tag">{{ tag }}</text>
      </view>
      <view class="meta-row">
        <text>{{ game.players }}</text>
        <text>{{ game.duration }}</text>
        <text>押金 ¥{{ game.deposit }}</text>
      </view>
      <text class="detail-description">{{ game.description }}</text>
      <button class="primary-button detail-button" @click="bookNow">立即预约</button>
    </view>
  </view>
</template>

<style scoped>
.detail-swiper {
  height: 420rpx;
}

.detail-image {
  width: 100%;
  height: 100%;
  border-radius: 36rpx;
}

.detail-card {
  margin-top: 24rpx;
  padding: 30rpx;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.detail-title,
.detail-category,
.detail-price,
.detail-description {
  display: block;
}

.detail-title {
  font-size: 40rpx;
  font-weight: 800;
}

.detail-category {
  margin-top: 8rpx;
  color: #71918d;
  font-size: 24rpx;
}

.detail-price {
  font-size: 38rpx;
  color: #159d8a;
  font-weight: 800;
}

.tag-row,
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 22rpx;
}

.meta-row {
  color: #668683;
  font-size: 25rpx;
}

.detail-description {
  margin-top: 24rpx;
  color: #395754;
  line-height: 1.85;
}

.detail-button {
  margin-top: 30rpx;
}
</style>
