<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { request } from "../../api";
import { useSessionStore } from "../../stores/session";

const sessionStore = useSessionStore();
const game = ref<any>(null);
const schools = ref<any[]>([]);
const deliverySlots = ref<any[]>([]);
const preview = ref<any>(null);
const statusBarHeight = ref(20);
const submitting = ref(false);
const schoolIndex = ref(0);

const hourOptions = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const selecting = ref<"start" | "end">("start");
const viewYear = ref(2026);
const viewMonth = ref(8);
const startHour = ref("10:00");
const endHour = ref("10:00");

const form = reactive({
  schoolId: "",
  deliverySlotId: "",
  rentalStartDate: "",
  rentalEndDate: "",
  contactName: "",
  contactPhone: "",
  addressDetail: "",
  couponCode: "",
});

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 1;
  const a = new Date(`${start.replace(/-/g, "/")} 00:00:00`).getTime();
  const b = new Date(`${end.replace(/-/g, "/")} 00:00:00`).getTime();
  return Math.max(Math.round((b - a) / (24 * 60 * 60 * 1000)), 1);
}

const rentalDays = computed(() =>
  daysBetween(form.rentalStartDate, form.rentalEndDate),
);

const totalAmount = computed(() => {
  if (preview.value?.totalAmount != null) {
    return Number(preview.value.totalAmount);
  }
  const daily = Number(game.value?.dailyPrice || 0);
  const deposit = Number(game.value?.deposit || 0);
  return daily * rentalDays.value + deposit;
});

const schoolRange = computed(() => schools.value.map((item) => item.name));
const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

const calendarCells = computed(() => {
  const y = viewYear.value;
  const m = viewMonth.value;
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: Array<{ day: number; dateStr: string; inMonth: boolean }> = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: 0, dateStr: "", inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateStr(y, m, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, dateStr: "", inMonth: false });
  }
  return cells;
});

function isStart(dateStr: string) {
  return !!dateStr && dateStr === form.rentalStartDate;
}
function isEnd(dateStr: string) {
  return !!dateStr && dateStr === form.rentalEndDate;
}
function isInRange(dateStr: string) {
  if (!dateStr || !form.rentalStartDate || !form.rentalEndDate) return false;
  return dateStr > form.rentalStartDate && dateStr < form.rentalEndDate;
}

function getStatusBarHeight() {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
  } catch {
    statusBarHeight.value = 20;
  }
}

function initDates() {
  const now = new Date();
  viewYear.value = now.getFullYear();
  viewMonth.value = now.getMonth() + 1;
  form.rentalStartDate = toDateStr(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  form.rentalEndDate = toDateStr(
    tomorrow.getFullYear(),
    tomorrow.getMonth() + 1,
    tomorrow.getDate(),
  );
}

function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
}

function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
}

function selectDateBox(which: "start" | "end") {
  selecting.value = which;
}

function onPickDay(dateStr: string) {
  if (!dateStr) return;
  if (selecting.value === "start") {
    form.rentalStartDate = dateStr;
    if (!form.rentalEndDate || form.rentalEndDate <= dateStr) {
      const d = new Date(`${dateStr.replace(/-/g, "/")} 00:00:00`);
      d.setDate(d.getDate() + 1);
      form.rentalEndDate = toDateStr(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
      );
    }
    selecting.value = "end";
  } else if (dateStr <= form.rentalStartDate) {
    form.rentalStartDate = dateStr;
    const d = new Date(`${dateStr.replace(/-/g, "/")} 00:00:00`);
    d.setDate(d.getDate() + 1);
    form.rentalEndDate = toDateStr(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
    );
  } else {
    form.rentalEndDate = dateStr;
  }
}

function matchDeliverySlot() {
  if (!deliverySlots.value.length) return;
  const hour = Number(startHour.value.split(":")[0]);
  const hit = deliverySlots.value.find((slot) => {
    const text = `${slot.label || ""} ${slot.timeRange || ""}`;
    const m = text.match(/(\d{1,2})\s*[:：]/);
    if (!m) return false;
    const start = Number(m[1]);
    return hour >= start && hour < start + 3;
  });
  form.deliverySlotId = (hit || deliverySlots.value[0]).id;
}

async function updatePreview() {
  if (!game.value?.id || !form.schoolId || !form.deliverySlotId) return;
  try {
    preview.value = await request("/app/orders/preview", {
      method: "POST",
      data: {
        gameId: game.value.id,
        ...form,
        contactName: form.contactName || "同学",
        contactPhone: form.contactPhone || "13800000000",
        addressDetail: form.addressDetail || "待补充地址",
      },
    });
  } catch {
    preview.value = null;
  }
}

function selectSchool(event: any) {
  schoolIndex.value = Number(event.detail.value);
  form.schoolId = schools.value[schoolIndex.value]?.id || "";
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.switchTab({ url: "/pages/index/index" });
}

async function submitOrder() {
  if (!form.contactName.trim() || !form.contactPhone.trim()) {
    uni.showToast({ title: "请填写联系人和电话", icon: "none" });
    return;
  }
  if (!form.addressDetail.trim() || form.addressDetail.trim().length < 3) {
    uni.showToast({ title: "请填写详细地址", icon: "none" });
    return;
  }
  if (!form.schoolId || !form.deliverySlotId) {
    uni.showToast({ title: "请完善学校与时段", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await updatePreview();
    const order = await request<any>("/app/orders", {
      method: "POST",
      token: sessionStore.token,
      data: { gameId: game.value.id, ...form },
    });
    await request("/app/payments/mock", {
      method: "POST",
      token: sessionStore.token,
      data: { orderId: order.id, outcome: "success" },
    });
    uni.showToast({ title: "下单成功", icon: "success" });
    setTimeout(() => uni.switchTab({ url: "/pages/orders/index" }), 600);
  } catch (error: any) {
    uni.showToast({
      title: error?.message || error?.data?.message || "下单失败",
      icon: "none",
    });
  } finally {
    submitting.value = false;
  }
}

watch(
  () => [
    form.rentalStartDate,
    form.rentalEndDate,
    form.schoolId,
    form.deliverySlotId,
    startHour.value,
  ],
  () => {
    matchDeliverySlot();
    updatePreview();
  },
);

onLoad(async (query) => {
  getStatusBarHeight();
  initDates();
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
  matchDeliverySlot();
  await updatePreview();
});
</script>

<template>
  <view v-if="game" class="page">
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-row">
        <view class="nav-back" @click="goBack">
          <view class="back-arrow"></view>
        </view>
        <text class="nav-title">确认订单</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="product-card">
        <image :src="game.coverImage" class="cover" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name">{{ game.name }}</text>
          <text class="product-meta">
            {{ game.players || "多人" }} | {{ game.duration || "时长不定" }}
          </text>
          <view class="price-row">
            <text class="price">¥{{ Number(game.dailyPrice).toFixed(2) }}/天</text>
            <text class="deposit">押金 ¥{{ Number(game.deposit).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">租赁日期</text>
          <text class="section-extra">共 {{ rentalDays }} 天</text>
        </view>
        <view class="date-boxes">
          <view
            :class="['date-box', { active: selecting === 'start' }]"
            @click="selectDateBox('start')"
          >
            <text class="date-label">开始日期</text>
            <text class="date-value">{{ form.rentalStartDate }}</text>
          </view>
          <view
            :class="['date-box', { active: selecting === 'end' }]"
            @click="selectDateBox('end')"
          >
            <text class="date-label">结束日期</text>
            <text class="date-value">{{ form.rentalEndDate }}</text>
          </view>
        </view>

        <view class="calendar">
          <view class="cal-head">
            <text class="cal-nav" @click="prevMonth">‹</text>
            <text class="cal-title">{{ viewYear }}年{{ viewMonth }}月</text>
            <text class="cal-nav" @click="nextMonth">›</text>
          </view>
          <view class="week-row">
            <text v-for="w in weekLabels" :key="w" class="week-cell">{{ w }}</text>
          </view>
          <view class="day-grid">
            <view
              v-for="(cell, idx) in calendarCells"
              :key="idx"
              class="day-cell"
              @click="onPickDay(cell.dateStr)"
            >
              <view
                v-if="cell.inMonth"
                :class="[
                  'day-inner',
                  {
                    start: isStart(cell.dateStr),
                    end: isEnd(cell.dateStr),
                    range: isInRange(cell.dateStr),
                  },
                ]"
              >
                <text class="day-num">{{ cell.day }}</text>
                <text v-if="isStart(cell.dateStr)" class="day-tag">开始</text>
                <text v-else-if="isEnd(cell.dateStr)" class="day-tag">结束</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section time-section">
        <view class="time-block">
          <text class="time-label">开始时间</text>
          <scroll-view scroll-x class="time-scroll" show-scrollbar="false">
            <view class="time-row">
              <view
                v-for="h in hourOptions"
                :key="'s-' + h"
                :class="['time-pill', { active: startHour === h }]"
                @click="startHour = h"
              >
                {{ h }}
              </view>
            </view>
          </scroll-view>
        </view>
        <view class="time-block">
          <text class="time-label">结束时间</text>
          <scroll-view scroll-x class="time-scroll" show-scrollbar="false">
            <view class="time-row">
              <view
                v-for="h in hourOptions"
                :key="'e-' + h"
                :class="['time-pill', { active: endHour === h }]"
                @click="endHour = h"
              >
                {{ h }}
              </view>
            </view>
          </scroll-view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">配送信息</text>
        </view>
        <picker :range="schoolRange" @change="selectSchool">
          <view class="form-row">
            <text class="form-label">学校</text>
            <text class="form-value">
              {{ schoolRange[schoolIndex] || "请选择学校" }}
            </text>
          </view>
        </picker>
        <view class="form-row">
          <text class="form-label">联系人</text>
          <input
            v-model="form.contactName"
            class="form-input"
            placeholder="请输入联系人"
          />
        </view>
        <view class="form-row">
          <text class="form-label">联系电话</text>
          <input
            v-model="form.contactPhone"
            class="form-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
          />
        </view>
        <view class="form-row top">
          <text class="form-label">详细地址</text>
          <textarea
            v-model="form.addressDetail"
            class="form-textarea"
            placeholder="宿舍楼、楼层、门牌号"
          />
        </view>
      </view>
      <view class="scroll-pad"></view>
    </scroll-view>

    <view class="footer">
      <view class="footer-total">
        <text class="footer-label">合计</text>
        <text class="footer-price">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">
        {{ submitting ? "提交中..." : "提交订单" }}
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #5b9cf5 0%, #dbeafe 16%, #f5f7fb 36%, #f5f7fb 100%);
  display: flex;
  flex-direction: column;
}
.nav { padding-left: 8rpx; padding-right: 24rpx; }
.nav-row {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-back, .nav-placeholder {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-arrow {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #ffffff;
  border-bottom: 4rpx solid #ffffff;
  transform: rotate(45deg);
  margin-left: 8rpx;
}
.nav-title { color: #ffffff; font-size: 34rpx; font-weight: 700; }
.scroll { flex: 1; height: 0; padding: 8rpx 24rpx 0; box-sizing: border-box; }
.product-card {
  display: flex;
  gap: 20rpx;
  padding: 22rpx;
  background: #ffffff;
  border-radius: 20rpx;
}
.cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.product-name { font-size: 32rpx; font-weight: 800; color: #111827; }
.product-meta { font-size: 24rpx; color: #9ca3af; }
.price-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.price { font-size: 32rpx; font-weight: 800; color: #ef4444; }
.deposit {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 20rpx;
}
.section {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.section-title { font-size: 30rpx; font-weight: 800; color: #111827; }
.section-extra { font-size: 24rpx; color: #6b7280; }
.date-boxes { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.date-box {
  flex: 1;
  padding: 20rpx 18rpx;
  border-radius: 16rpx;
  background: #f8fafc;
  border: 2rpx solid transparent;
}
.date-box.active { border-color: #3b82f6; background: #eff6ff; }
.date-label { display: block; font-size: 22rpx; color: #9ca3af; margin-bottom: 8rpx; }
.date-value { display: block; font-size: 28rpx; font-weight: 700; color: #111827; }
.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.cal-title { font-size: 28rpx; font-weight: 700; color: #111827; }
.cal-nav {
  width: 56rpx;
  text-align: center;
  font-size: 40rpx;
  color: #6b7280;
  line-height: 1;
}
.week-row, .day-grid { display: flex; flex-wrap: wrap; }
.week-cell, .day-cell { width: 14.2857%; text-align: center; }
.week-cell { font-size: 22rpx; color: #9ca3af; padding: 10rpx 0 16rpx; }
.day-cell { padding: 4rpx 0; min-height: 84rpx; }
.day-inner {
  margin: 0 auto;
  width: 72rpx;
  min-height: 72rpx;
  border-radius: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
}
.day-inner.range { background: #eff6ff; }
.day-inner.start, .day-inner.end { background: #3b82f6; }
.day-num { font-size: 26rpx; color: #111827; font-weight: 600; }
.day-inner.start .day-num,
.day-inner.end .day-num,
.day-inner.start .day-tag,
.day-inner.end .day-tag { color: #ffffff; }
.day-tag { font-size: 16rpx; line-height: 1.1; }
.time-section { padding-bottom: 12rpx; }
.time-block { margin-bottom: 18rpx; }
.time-label {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 14rpx;
}
.time-scroll { white-space: nowrap; }
.time-row { display: inline-flex; gap: 12rpx; }
.time-pill {
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 24rpx;
  border: 2rpx solid transparent;
}
.time-pill.active {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #3b82f6;
  font-weight: 700;
}
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.form-row.top { align-items: flex-start; }
.form-row:last-child { border-bottom: none; }
.form-label { font-size: 28rpx; color: #6b7280; flex-shrink: 0; }
.form-value, .form-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #111827;
}
.form-textarea {
  flex: 1;
  min-height: 100rpx;
  text-align: right;
  font-size: 28rpx;
  color: #111827;
}
.scroll-pad { height: 160rpx; }
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  z-index: 30;
}
.footer-total {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  min-width: 220rpx;
}
.footer-label { font-size: 26rpx; color: #6b7280; }
.footer-price { font-size: 36rpx; font-weight: 800; color: #ef4444; }
.submit-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 999rpx;
  background: #ef4444;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
