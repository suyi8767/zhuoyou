<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const statusBarHeight = ref(20);
const brandTitle = "云小夏桌游租赁";
const activeTab = ref("party");
const home = ref<any>({
  banners: [],
  categories: [],
  featuredGames: [],
  homeConfig: {},
});

const defaultShortcuts = [
  { id: "party", name: "聚会欢乐", iconText: "聚" },
  { id: "strategy", name: "策略烧脑", iconText: "策" },
  { id: "couple", name: "双人约局", iconText: "双" },
  { id: "fresh", name: "新手友好", iconText: "新" },
  { id: "campus", name: "校园热门", iconText: "热" },
];
const mockRankingData: Record<string, Array<Record<string, string | number>>> = {
  party: [
    {
      id: "mock-party-1",
      name: "【爆款】狼人杀青春局",
      players: "6-12 人",
      dailyPrice: 12,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-party-2",
      name: "【爆款】阿瓦隆社团局",
      players: "5-10 人",
      dailyPrice: 15,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-party-3",
      name: "【爆款】谁是卧底热场局",
      players: "4-10 人",
      dailyPrice: 9,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-party-4",
      name: "【爆款】你画我猜欢乐局",
      players: "4-8 人",
      dailyPrice: 8,
      coverImage: "/static/banner-default.png",
    },
  ],
  strategy: [
    {
      id: "mock-strategy-1",
      name: "【爆款】卡坦岛经典策略",
      players: "3-4 人",
      dailyPrice: 18,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-strategy-2",
      name: "【爆款】火星开发沉浸局",
      players: "1-5 人",
      dailyPrice: 28,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-strategy-3",
      name: "【爆款】七大奇迹构筑局",
      players: "3-7 人",
      dailyPrice: 16,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-strategy-4",
      name: "【爆款】璀璨宝石轻策略",
      players: "2-4 人",
      dailyPrice: 11,
      coverImage: "/static/banner-default.png",
    },
  ],
  fresh: [
    {
      id: "mock-fresh-1",
      name: "【新手】UNO 上手快",
      players: "2-8 人",
      dailyPrice: 6,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-fresh-2",
      name: "【新手】三国杀入门局",
      players: "4-8 人",
      dailyPrice: 10,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-fresh-3",
      name: "【新手】卡卡颂轻松拼图",
      players: "2-5 人",
      dailyPrice: 12,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-fresh-4",
      name: "【新手】妙语说书人",
      players: "3-6 人",
      dailyPrice: 10,
      coverImage: "/static/banner-default.png",
    },
  ],
  campus: [
    {
      id: "mock-campus-1",
      name: "【校园】寝室夜聊局",
      players: "4-6 人",
      dailyPrice: 7,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-campus-2",
      name: "【校园】社团破冰局",
      players: "6-10 人",
      dailyPrice: 11,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-campus-3",
      name: "【校园】情侣双人局",
      players: "2 人",
      dailyPrice: 13,
      coverImage: "/static/banner-default.png",
    },
    {
      id: "mock-campus-4",
      name: "【校园】周末通宵局",
      players: "3-8 人",
      dailyPrice: 14,
      coverImage: "/static/banner-default.png",
    },
  ],
};
const serviceHighlights = [
  { id: "credit", title: "信用免押", badge: "免" },
  { id: "after-sale", title: "售后无忧", badge: "护" },
  { id: "delivery", title: "极速快送", badge: "达" },
  { id: "campus", title: "校园可达", badge: "校" },
];
const featuredProducts = [
  { id: "featured-1", name: "大疆 Pocket3", price: "¥5/天", image: "/static/banner-default.png", tag: "特价" },
  { id: "featured-2", name: "索尼微单局", price: "¥18/天", image: "/static/banner-default.png", tag: "爆款" },
  { id: "featured-3", name: "富士复古局", price: "¥16/天", image: "/static/banner-default.png", tag: "热门" },
  { id: "featured-4", name: "GoPro 运动局", price: "¥12/天", image: "/static/banner-default.png", tag: "特价" },
];
const latestDrops = [
  { id: "latest-1", name: "阿瓦隆", image: "/static/banner-default.png" },
  { id: "latest-2", name: "卡坦岛", image: "/static/banner-default.png" },
  { id: "latest-3", name: "狼人杀", image: "/static/banner-default.png" },
  { id: "latest-4", name: "璀璨宝石", image: "/static/banner-default.png" },
];
const goodStuffTabs = [
  { key: "good", label: "好物严选", subtitle: "桌游优选" },
  { key: "camera", label: "聚会热门", subtitle: "宿舍社团" },
  { key: "card", label: "双人约局", subtitle: "情侣轻松" },
  { key: "micro", label: "策略烧脑", subtitle: "进阶玩家" },
];
const goodStuffProducts = [
  { id: "good-1", name: "【爆款】阿瓦隆聚会版 一次下单轻松组局", price: "¥15/天", note: "1天起租", image: "/static/banner-default.png" },
  { id: "good-2", name: "【爆款】卡坦岛经典版 宿舍周末局", price: "¥18/天", note: "1天起租", image: "/static/banner-default.png" },
  { id: "good-3", name: "【爆款】狼人杀青春版 夜聊热场", price: "¥12/天", note: "1天起租", image: "/static/banner-default.png" },
  { id: "good-4", name: "【爆款】璀璨宝石双人轻策略", price: "¥11/天", note: "1天起租", image: "/static/banner-default.png" },
  { id: "good-5", name: "【爆款】妙语说书人 朋友破冰局", price: "¥10/天", note: "1天起租", image: "/static/banner-default.png" },
  { id: "good-6", name: "【爆款】火星开发 硬核策略局", price: "¥28/天", note: "1天起租", image: "/static/banner-default.png" },
];

const bannerList = computed(() => [
  {
    id: "default-banner",
    title: brandTitle,
    subtitle: "大学城桌游上门，青春聚会轻松开场",
    image: "/static/banner-default.png",
  },
]);

const shortcutCategories = computed(() => {
  const categories = home.value.categories || [];
  return defaultShortcuts.map((item, index) => ({
    ...item,
    categoryId: categories[index]?.id || "",
  }));
});

const featuredGames = computed(() => home.value.featuredGames || []);

const rankingTabs = [
  { key: "party", label: "聚会热门" },
  { key: "strategy", label: "策略烧脑" },
  { key: "fresh", label: "新手友好" },
  { key: "campus", label: "校园拼局" },
];

const rankingGames = computed(() => {
  const games = featuredGames.value.length ? featuredGames.value : [];
  if (!games.length) {
    return mockRankingData[activeTab.value] || mockRankingData.party;
  }
  if (activeTab.value === "strategy") {
    return games.filter(
      (game: any) =>
        (game.tags || []).some((tag: string) => tag.includes("策略")) ||
        String(game.players || "").includes("3") ||
        String(game.players || "").includes("5"),
    );
  }
  if (activeTab.value === "fresh") {
    return games.filter((game: any) =>
      (game.tags || []).some((tag: string) => tag.includes("新手")),
    );
  }
  if (activeTab.value === "campus") {
    return games.filter((game: any) =>
      (game.tags || []).some(
        (tag: string) => tag.includes("聚会") || tag.includes("社团"),
      ),
    );
  }
  return games.length ? games : mockRankingData.party;
});

const collageCards = computed(() => {
  const games = featuredGames.value;
  return [
    {
      id: "collage-main",
      title: "毕业季桌游推荐",
      subtitle: "青春不散场，聚会记录更尽兴",
      image: games[0]?.coverImage || "/static/banner-default.png",
      gameId: games[0]?.id,
    },
    {
      id: "collage-side-1",
      title: games[1]?.name || "阿瓦隆",
      subtitle: "立即租组局",
      image: games[1]?.coverImage || "/static/banner-default.png",
      gameId: games[1]?.id,
    },
    {
      id: "collage-side-2",
      title: games[2]?.name || "卡坦岛",
      subtitle: "立即租组局",
      image: games[2]?.coverImage || "/static/banner-default.png",
      gameId: games[2]?.id,
    },
  ];
});

async function loadHome() {
  await sessionStore.ensureUserSession();
  home.value = await request("/app/home");
}

function getStatusBarHeight() {
  try {
    const info = uni.getSystemInfoSync();
    statusBarHeight.value = info.statusBarHeight || 20;
  } catch {
    statusBarHeight.value = 20;
  }
}

function goGames(categoryId?: string) {
  uni.switchTab({ url: "/pages/games/index" });
  if (categoryId) {
    setTimeout(() => {
      uni.$emit("change-category", categoryId);
    }, 100);
  }
}

function goDetail(id?: string) {
  if (!id) {
    goGames();
    return;
  }
  uni.navigateTo({
    url: `/pages/game-detail/index?id=${id}`,
  });
}

function goAdminEntry() {
  if (!home.value.homeConfig?.miniAdminEnabled) {
    uni.showToast({ title: "管理员入口已关闭", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/admin-login/index" });
}

onLoad(async () => {
  getStatusBarHeight();
  await loadHome();
});

onPullDownRefresh(async () => {
  await loadHome();
  uni.stopPullDownRefresh();
});
</script>

<template>
  <view class="home-page">
    <view class="top-section" :style="{ paddingTop: statusBarHeight + 'px' }" @longpress="goAdminEntry">
      <view class="page-header">
        <text class="page-title">{{ brandTitle }}</text>
        <view class="title-decoration"></view>
      </view>
    </view>

    <view class="navbar-placeholder"></view>

    <view class="page-shell">
      <view class="banner-window" @longpress="goAdminEntry">
        <swiper
          autoplay
          circular
          class="hero-swiper"
          indicator-dots
          indicator-active-color="#ffffff"
        >
          <swiper-item v-for="banner in bannerList" :key="banner.id">
            <view class="banner-card">
              <image :src="banner.image" class="banner-image" mode="aspectFill" />
              <view class="banner-mask">
                <view class="banner-copy">
                  <text class="banner-title">{{ banner.title }}</text>
                  <text class="banner-subtitle">{{ banner.subtitle }}</text>
                </view>
                <button class="banner-button" @click.stop="goGames()">立即租组局</button>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="search-bar" @click="goGames()">
        <text class="search-icon">⌕</text>
        <text class="search-placeholder">搜索桌游 / 聚会主题 / 人数玩法</text>
      </view>

      <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
        <view class="category-row">
          <view
            v-for="category in shortcutCategories"
            :key="category.id"
            class="category-pill"
            @click="goGames(category.categoryId || undefined)"
          >
            <view class="category-icon">{{ category.iconText }}</view>
            <text class="category-label">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="ranking-section">
        <view class="ranking-header">
          <text class="ranking-title">热租榜单</text>
          <scroll-view scroll-x class="ranking-tabs" show-scrollbar="false">
            <view class="tab-row">
              <view
                v-for="tab in rankingTabs"
                :key="tab.key"
                :class="['ranking-tab', { active: activeTab === tab.key }]"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </view>
            </view>
          </scroll-view>
        </view>

        <scroll-view scroll-x class="goods-scroll" show-scrollbar="false">
          <view class="goods-row">
            <view
              v-for="game in rankingGames"
              :key="game.id"
              class="goods-card"
              @click="goDetail(game.id)"
            >
              <image :src="game.coverImage" class="goods-image" mode="aspectFit" />
              <view class="goods-body">
                <text class="goods-name">{{ game.name }}</text>
                <text class="goods-subtitle">{{ game.players }}</text>
                <text class="goods-price">¥{{ game.dailyPrice }}/天</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="collage-section">
        <view class="collage-grid">
          <view
            class="collage-main"
            :style="{ backgroundImage: `url(${collageCards[0]?.image})` }"
            @click="goDetail(collageCards[0]?.gameId)"
          >
            <view class="collage-overlay"></view>
            <view class="collage-copy">
              <text class="collage-title">{{ collageCards[0]?.title }}</text>
              <text class="collage-subtitle">{{ collageCards[0]?.subtitle }}</text>
              <text class="collage-button">立即租组局</text>
            </view>
          </view>

          <view class="collage-side">
            <view
              v-for="card in collageCards.slice(1)"
              :key="card.id"
              class="collage-small"
              :style="{ backgroundImage: `url(${card.image})` }"
              @click="goDetail(card.gameId)"
            >
              <view class="collage-overlay light"></view>
              <view class="collage-copy small">
                <text class="collage-small-title">{{ card.title }}</text>
                <text class="collage-button small">立即租组局</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="highlight-strip">
        <view v-for="item in serviceHighlights" :key="item.id" class="highlight-item">
          <view class="highlight-badge">{{ item.badge }}</view>
          <text class="highlight-text">{{ item.title }}</text>
        </view>
      </view>

      <view class="content-section">
        <view class="content-section-header">
          <text class="content-section-title">特色产品</text>
          <text class="content-section-subtitle">聚会优选 · 经济实惠</text>
        </view>
        <scroll-view scroll-x class="mini-scroll" show-scrollbar="false">
          <view class="mini-row">
            <view
              v-for="item in featuredProducts"
              :key="item.id"
              class="mini-product-card"
              @click="goGames()"
            >
              <view class="mini-product-tag">{{ item.tag }}</view>
              <image :src="item.image" class="mini-product-image" mode="aspectFit" />
              <text class="mini-product-name">{{ item.name }}</text>
              <text class="mini-product-price">{{ item.price }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="content-section">
        <view class="content-section-header">
          <text class="content-section-title">新品动态</text>
          <text class="content-section-subtitle">天天有新货 · 口碑有好局</text>
        </view>
        <scroll-view scroll-x class="mini-scroll" show-scrollbar="false">
          <view class="latest-row">
            <view
              v-for="item in latestDrops"
              :key="item.id"
              class="latest-card"
              @click="goGames()"
            >
              <image :src="item.image" class="latest-image" mode="aspectFit" />
              <text class="latest-name">{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="content-section">
        <view class="content-section-header stacked">
          <text class="content-section-title">好物严选</text>
          <scroll-view scroll-x class="good-tabs-scroll" show-scrollbar="false">
            <view class="good-tabs-row">
              <view v-for="tab in goodStuffTabs" :key="tab.key" class="good-tab">
                <text class="good-tab-title">{{ tab.label }}</text>
                <text class="good-tab-subtitle">{{ tab.subtitle }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="masonry-grid">
          <view
            v-for="item in goodStuffProducts"
            :key="item.id"
            class="masonry-card"
            @click="goGames()"
          >
            <image :src="item.image" class="masonry-image" mode="aspectFit" />
            <view class="masonry-body">
              <text class="masonry-name">{{ item.name }}</text>
              <view class="masonry-footer">
                <text class="masonry-price">{{ item.price }}</text>
                <text class="masonry-note">{{ item.note }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
view,
text,
image,
button,
scroll-view {
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(74, 144, 226, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(38, 166, 154, 0.24), transparent 26%),
    linear-gradient(180deg, #edf8f7 0%, #f8fbff 52%, #f3f7fb 100%);
}

.top-section {
  background:
    radial-gradient(circle at right top, rgba(255, 255, 255, 0.18), transparent 22%),
    linear-gradient(to top right, #4a90e2 0%, #4a90e2 56%, #26a69a 100%);
  padding: calc(var(--status-bar-height) + 40rpx) 40rpx 120rpx;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 16rpx 40rpx rgba(38, 166, 154, 0.18);
}

.page-header {
  margin-bottom: 40rpx;
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: inline-block;
  position: relative;
  z-index: 2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-decoration {
  position: absolute;
  left: 24rpx;
  right: -24rpx;
  bottom: -1rpx;
  height: 27rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8rpx;
  z-index: 1;
}

.navbar-placeholder {
  height: 18rpx;
  flex-shrink: 0;
}

.page-shell {
  padding: 8rpx 24rpx 36rpx;
  position: relative;
  z-index: 40;
}

.banner-window {
  margin-top: -118rpx;
  border-radius: 28rpx;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 18rpx 38rpx rgba(53, 109, 126, 0.16);
}

.hero-swiper {
  height: 202rpx;
}

.search-bar {
  margin-top: 20rpx;
  height: 82rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 252, 255, 0.96));
  border: 2rpx solid rgba(117, 180, 204, 0.14);
  box-shadow: 0 12rpx 28rpx rgba(76, 112, 132, 0.08);
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 14rpx;
  overflow: hidden;
}

.search-icon {
  color: #5d8e99;
  font-size: 30rpx;
  line-height: 1;
}

.search-placeholder {
  color: #86a1a8;
  font-size: 24rpx;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-card {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24rpx 24rpx;
  background: linear-gradient(180deg, rgba(13, 34, 40, 0.08), rgba(11, 33, 39, 0.56));
}

.banner-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  width: 68%;
  min-width: 0;
}

.banner-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.92);
  font-size: 20rpx;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.banner-button {
  margin: 0;
  width: 164rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.95);
  color: #1c7f92;
  font-size: 22rpx;
  font-weight: 700;
}

.category-scroll {
  margin-top: 30rpx;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.66);
  border-radius: 28rpx;
  padding: 20rpx 8rpx 16rpx;
  box-shadow: 0 12rpx 28rpx rgba(90, 137, 172, 0.08);
}

.category-row {
  display: inline-flex;
  gap: 24rpx;
  padding: 0 10rpx;
}

.category-pill {
  width: 118rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  min-width: 0;
}

.category-icon {
  width: 98rpx;
  height: 98rpx;
  border-radius: 49rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.92), transparent 42%),
    linear-gradient(180deg, #ffffff 0%, #eef6ff 100%);
  color: #3f8fdc;
  font-size: 34rpx;
  font-weight: 700;
  box-shadow: 0 12rpx 26rpx rgba(90, 137, 172, 0.14);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
}

.category-label {
  font-size: 24rpx;
  color: #2b2f32;
  text-align: center;
  line-height: 1.3;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ranking-section {
  margin-top: 30rpx;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 30rpx;
  padding: 24rpx 20rpx 22rpx;
  box-shadow: 0 14rpx 32rpx rgba(87, 112, 128, 0.09);
}

.ranking-header {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-width: 0;
}

.ranking-title {
  font-size: 42rpx;
  font-weight: 800;
  color: #2b2f32;
  flex-shrink: 0;
  letter-spacing: -0.5rpx;
}

.ranking-tabs {
  flex: 1;
  white-space: nowrap;
  background: rgba(245, 247, 250, 0.95);
  border-radius: 999rpx;
  padding: 12rpx 16rpx 10rpx;
  min-width: 0;
  overflow: hidden;
}

.tab-row {
  display: inline-flex;
  gap: 26rpx;
}

.ranking-tab {
  position: relative;
  font-size: 26rpx;
  color: #7a7f86;
  padding-bottom: 10rpx;
}

.ranking-tab.active {
  color: #2b2f32;
  font-weight: 700;
}

.ranking-tab.active::after {
  content: "";
  position: absolute;
  left: 8rpx;
  right: 8rpx;
  bottom: 0;
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ff648c, #ff2d55);
}

.goods-scroll {
  margin-top: 24rpx;
  white-space: nowrap;
}

.goods-row {
  display: inline-flex;
  gap: 14rpx;
  padding-bottom: 8rpx;
}

.goods-card {
  width: 184rpx;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 20rpx;
  overflow: hidden;
  border: 2rpx solid rgba(235, 242, 248, 0.92);
  box-shadow: 0 12rpx 28rpx rgba(80, 113, 132, 0.09);
  min-width: 0;
}

.goods-image {
  width: 100%;
  height: 164rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%);
}

.goods-body {
  padding: 14rpx 14rpx 18rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.goods-name {
  font-size: 22rpx;
  color: #2c3136;
  line-height: 1.35;
  min-height: 64rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: break-all;
  white-space: normal;
}

.goods-subtitle {
  font-size: 20rpx;
  color: #8a8f96;
}

.goods-price {
  font-size: 28rpx;
  color: #ff2d55;
  font-weight: 800;
}

.collage-section {
  margin-top: 26rpx;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 30rpx;
  padding: 18rpx;
  box-shadow: 0 14rpx 30rpx rgba(87, 112, 128, 0.08);
}

.collage-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14rpx;
}

.collage-main,
.collage-small {
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  border-radius: 22rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.75);
}

.collage-main {
  min-height: 320rpx;
}

.collage-side {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 14rpx;
}

.collage-small {
  min-height: 153rpx;
}

.collage-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(15, 36, 47, 0.48));
}

.collage-overlay.light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(18, 30, 45, 0.36));
}

.collage-copy {
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 24rpx 22rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
}

.collage-copy.small {
  justify-content: flex-end;
  gap: 12rpx;
}

.collage-title {
  font-size: 46rpx;
  color: #ffffff;
  font-weight: 800;
  line-height: 1.08;
  text-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.collage-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.92);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collage-small-title {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.collage-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 150rpx;
  height: 50rpx;
  border-radius: 999rpx;
  background: #ff2d55;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.collage-button.small {
  width: 132rpx;
  height: 44rpx;
  font-size: 20rpx;
}

.highlight-strip {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10rpx;
}

.highlight-item {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 251, 255, 0.9));
  border-radius: 18rpx;
  padding: 16rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 10rpx 22rpx rgba(91, 118, 134, 0.08);
  min-width: 0;
  overflow: hidden;
}

.highlight-badge {
  width: 46rpx;
  height: 46rpx;
  border-radius: 23rpx;
  background: linear-gradient(135deg, #ffcf82, #ff8f5c);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlight-text {
  font-size: 22rpx;
  color: #45484d;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-section {
  margin-top: 26rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30rpx;
  padding: 22rpx 20rpx 24rpx;
  box-shadow: 0 14rpx 30rpx rgba(87, 112, 128, 0.08);
}

.content-section-header {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 18rpx;
  min-width: 0;
}

.content-section-header.stacked {
  display: block;
}

.content-section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #24282d;
  position: relative;
  padding-left: 16rpx;
}

.content-section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 6rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #4a90e2, #26a69a);
}

.content-section-subtitle {
  font-size: 20rpx;
  color: #9b9fa6;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-scroll,
.good-tabs-scroll {
  white-space: nowrap;
}

.mini-row {
  display: inline-flex;
  gap: 14rpx;
}

.mini-product-card {
  position: relative;
  width: 166rpx;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 18rpx;
  padding: 14rpx 12rpx 16rpx;
  border: 2rpx solid rgba(235, 242, 248, 0.9);
  box-shadow: 0 8rpx 24rpx rgba(83, 110, 128, 0.08);
  min-width: 0;
  overflow: hidden;
}

.mini-product-tag {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  background: linear-gradient(135deg, #b33cff, #ff4dd8);
  color: #ffffff;
  font-size: 18rpx;
}

.mini-product-image {
  width: 100%;
  height: 136rpx;
}

.mini-product-name {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.35;
  color: #2c3136;
  min-height: 62rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.mini-product-price {
  margin-top: 8rpx;
  font-size: 30rpx;
  color: #ff2d55;
  font-weight: 800;
}

.latest-row {
  display: inline-flex;
  gap: 14rpx;
}

.latest-card {
  width: 128rpx;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 16rpx;
  padding: 12rpx;
  border: 2rpx solid rgba(236, 242, 248, 0.9);
  box-shadow: 0 8rpx 20rpx rgba(83, 110, 128, 0.08);
  min-width: 0;
  overflow: hidden;
}

.latest-image {
  width: 100%;
  height: 88rpx;
}

.latest-name {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #2c3136;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.good-tabs-row {
  display: inline-flex;
  gap: 22rpx;
  margin-top: 12rpx;
  padding-bottom: 4rpx;
}

.good-tab {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  max-width: 160rpx;
}

.good-tab-title {
  font-size: 28rpx;
  color: #34393f;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.good-tab-subtitle {
  font-size: 20rpx;
  color: #9b9fa6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.masonry-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.masonry-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 20rpx;
  overflow: hidden;
  border: 2rpx solid rgba(235, 242, 248, 0.92);
  box-shadow: 0 10rpx 22rpx rgba(84, 114, 134, 0.08);
}

.masonry-image {
  width: 100%;
  height: 208rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
}

.masonry-body {
  padding: 14rpx 14rpx 18rpx;
}

.masonry-name {
  font-size: 24rpx;
  line-height: 1.4;
  color: #2c3136;
  min-height: 94rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.masonry-footer {
  margin-top: 10rpx;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.masonry-price {
  font-size: 30rpx;
  color: #ff2d55;
  font-weight: 800;
}

.masonry-note {
  font-size: 18rpx;
  color: #9ca1a9;
}
</style>
