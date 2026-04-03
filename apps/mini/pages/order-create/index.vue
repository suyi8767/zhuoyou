<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const game = ref<any>(null);
const schools = ref<any[]>([]);
const deliverySlots = ref<any[]>([]);
const preview = ref<any>(null);
const schoolIndex = ref(0);
const slotIndex = ref(0);

const form = reactive({
  schoolId: "",
  deliverySlotId: "",
  rentalStartDate: new Date().toISOString().slice(0, 10),
  rentalEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  contactName: "",
  contactPhone: "",
  addressDetail: "",
  couponCode: "",
});

const schoolRange = computed(() => schools.value.map((item) => item.name));
const slotRange = computed(() =>
  deliverySlots.value.map((item) => `${item.label} ${item.timeRange}`),
);

onLoad(async (query) => {
  await sessionStore.ensureUserSession();
  const [nextGame, nextSchools, nextSlots] = await Promise.all([
    request(`/app/games/${String(query?.gameId || "")}`),
    request<any[]>("/app/schools"),
    request<any[]>("/app/delivery-slots"),
  ]);

  game.value = nextGame;
  schools.value = nextSchools;
  deliverySlots.value = nextSlots;
  form.schoolId = schools.value[0]?.id || "";
  form.deliverySlotId = deliverySlots.value[0]?.id || "";
  form.contactName = sessionStore.user?.recentContactName || "";
  form.contactPhone = sessionStore.user?.recentContactPhone || "";
});

async function updatePreview() {
  preview.value = await request("/app/orders/preview", {
    method: "POST",
    data: {
      gameId: game.value.id,
      ...form,
    },
  });
}

async function submitOrder() {
  try {
    await updatePreview();
    const order = await request<any>("/app/orders", {
      method: "POST",
      token: sessionStore.token,
      data: {
        gameId: game.value.id,
        ...form,
      },
    });
    await request("/app/payments/mock", {
      method: "POST",
      token: sessionStore.token,
      data: {
        orderId: order.id,
        outcome: "success",
      },
    });
    uni.showToast({ title: "下单成功", icon: "success" });
    setTimeout(() => {
      uni.switchTab({ url: "/pages/orders/index" });
    }, 600);
  } catch (error: any) {
    uni.showToast({
      title: error?.message || error?.data?.message || "下单失败",
      icon: "none",
    });
  }
}

function selectSchool(event: any) {
  schoolIndex.value = Number(event.detail.value);
  form.schoolId = schools.value[schoolIndex.value]?.id || "";
}

function selectSlot(event: any) {
  slotIndex.value = Number(event.detail.value);
  form.deliverySlotId = deliverySlots.value[slotIndex.value]?.id || "";
}
</script>

<template>
  <view v-if="game" class="page-shell">
    <view class="hero-card order-hero">
      <image :src="game.coverImage" class="order-cover" mode="aspectFill" />
      <view class="order-hero-copy">
        <text class="order-title">{{ game.name }}</text>
        <text class="order-meta">{{ game.players }} · {{ game.duration }}</text>
        <text class="order-price">¥{{ game.dailyPrice }}/天 · 押金 ¥{{ game.deposit }}</text>
      </view>
    </view>

    <view class="panel-card form-card">
      <picker :range="schoolRange" @change="selectSchool">
        <view class="form-row">
          <text>学校</text>
          <text>{{ schoolRange[schoolIndex] || "请选择学校" }}</text>
        </view>
      </picker>
      <picker :range="slotRange" @change="selectSlot">
        <view class="form-row">
          <text>送达时段</text>
          <text>{{ slotRange[slotIndex] || "请选择时段" }}</text>
        </view>
      </picker>
      <view class="form-row">
        <text>开始日期</text>
        <input v-model="form.rentalStartDate" type="text" />
      </view>
      <view class="form-row">
        <text>结束日期</text>
        <input v-model="form.rentalEndDate" type="text" />
      </view>
      <view class="form-row">
        <text>联系人</text>
        <input v-model="form.contactName" type="text" />
      </view>
      <view class="form-row">
        <text>联系电话</text>
        <input v-model="form.contactPhone" maxlength="11" type="number" />
      </view>
      <view class="form-row textarea-row">
        <text>详细地址</text>
        <textarea v-model="form.addressDetail" placeholder="宿舍楼、楼层、门牌号" />
      </view>
      <view class="form-row">
        <text>优惠码</text>
        <input v-model="form.couponCode" placeholder="可不填，如 CAMPUS20" type="text" />
      </view>
    </view>

    <view class="section-title">
      <text>价格预览</text>
      <text @click="updatePreview">刷新金额</text>
    </view>
    <view class="panel-card summary-card">
      <view class="summary-row">
        <text>租金小计</text>
        <text>¥{{ preview?.rentSubtotal || 0 }}</text>
      </view>
      <view class="summary-row">
        <text>押金</text>
        <text>¥{{ preview?.deposit || game.deposit }}</text>
      </view>
      <view class="summary-row">
        <text>优惠</text>
        <text>-¥{{ preview?.discountAmount || 0 }}</text>
      </view>
      <view class="summary-row total">
        <text>应付总额</text>
        <text>¥{{ preview?.totalAmount || game.dailyPrice + game.deposit }}</text>
      </view>
      <button class="primary-button submit-button" @click="submitOrder">
        提交订单并模拟支付
      </button>
    </view>
  </view>
</template>

<style scoped>
.order-hero {
  display: flex;
  padding: 22rpx;
  gap: 20rpx;
  align-items: center;
}

.order-cover {
  width: 180rpx;
  height: 180rpx;
  border-radius: 26rpx;
}

.order-hero-copy {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.order-title {
  font-size: 34rpx;
  font-weight: 800;
}

.order-meta,
.order-price {
  color: #6a8b87;
}

.form-card,
.summary-card {
  padding: 22rpx 26rpx;
}

.form-row,
.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(21, 157, 138, 0.1);
}

.form-row input,
.form-row textarea {
  width: 56%;
  text-align: right;
  color: #173b3a;
}

.textarea-row {
  align-items: flex-start;
}

.textarea-row textarea {
  min-height: 120rpx;
}

.total {
  font-size: 32rpx;
  color: #159d8a;
  font-weight: 700;
}

.submit-button {
  margin-top: 26rpx;
}
</style>
