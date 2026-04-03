<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

interface Address {
  id: string;
  name: string;
  phone: string;
  school: string;
  detail: string;
  isDefault: boolean;
}

const addresses = ref<Address[]>([]);
const showForm = ref(false);
const editingId = ref("");
const form = ref({ name: "", phone: "", school: "", detail: "" });

function loadAddresses() {
  try {
    const raw = uni.getStorageSync("user_addresses");
    addresses.value = raw ? JSON.parse(raw) : [];
  } catch {
    addresses.value = [];
  }
}

function saveAddresses() {
  uni.setStorageSync("user_addresses", JSON.stringify(addresses.value));
}

function openAdd() {
  editingId.value = "";
  form.value = { name: "", phone: "", school: "", detail: "" };
  showForm.value = true;
}

function openEdit(addr: Address) {
  editingId.value = addr.id;
  form.value = { name: addr.name, phone: addr.phone, school: addr.school, detail: addr.detail };
  showForm.value = true;
}

function saveForm() {
  if (!form.value.name.trim() || !form.value.phone.trim() || !form.value.detail.trim()) {
    uni.showToast({ title: "请完整填写信息", icon: "none" });
    return;
  }
  if (editingId.value) {
    const idx = addresses.value.findIndex((a) => a.id === editingId.value);
    if (idx >= 0) {
      addresses.value[idx] = { ...addresses.value[idx], ...form.value };
    }
  } else {
    addresses.value.push({
      id: `addr_${Date.now()}`,
      ...form.value,
      isDefault: addresses.value.length === 0,
    });
  }
  saveAddresses();
  showForm.value = false;
  uni.showToast({ title: "保存成功", icon: "success" });
}

function setDefault(id: string) {
  addresses.value.forEach((a) => {
    a.isDefault = a.id === id;
  });
  saveAddresses();
}

function removeAddress(id: string) {
  uni.showModal({
    title: "确认删除",
    content: "确定要删除这个地址吗？",
    success(res) {
      if (res.confirm) {
        addresses.value = addresses.value.filter((a) => a.id !== id);
        if (addresses.value.length && !addresses.value.some((a) => a.isDefault)) {
          addresses.value[0].isDefault = true;
        }
        saveAddresses();
        uni.showToast({ title: "已删除", icon: "success" });
      }
    },
  });
}

onShow(() => {
  loadAddresses();
});
</script>

<template>
  <view class="page">
    <!-- 地址列表 -->
    <view v-if="!showForm">
      <view v-if="!addresses.length" class="empty">
        <text class="empty-text">还没有收货地址</text>
      </view>

      <view v-for="addr in addresses" :key="addr.id" class="card">
        <view class="card-top">
          <text class="addr-name">{{ addr.name }}</text>
          <text class="addr-phone">{{ addr.phone }}</text>
          <view v-if="addr.isDefault" class="default-tag">默认</view>
        </view>
        <text class="addr-detail">{{ addr.school ? addr.school + ' · ' : '' }}{{ addr.detail }}</text>
        <view class="card-actions">
          <view class="action-left">
            <view class="check-row" @click="setDefault(addr.id)">
              <view :class="['check-box', { checked: addr.isDefault }]"></view>
              <text class="check-label">设为默认</text>
            </view>
          </view>
          <view class="action-right">
            <text class="action-link" @click="openEdit(addr)">编辑</text>
            <text class="action-link danger" @click="removeAddress(addr.id)">删除</text>
          </view>
        </view>
      </view>

      <view class="add-btn" @click="openAdd">
        <text class="add-text">+ 新增收货地址</text>
      </view>
    </view>

    <!-- 编辑表单 -->
    <view v-else class="form-wrap">
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">联系人</text>
          <input class="form-input" v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="form.phone" type="number" placeholder="请输入手机号" />
        </view>
        <view class="form-item">
          <text class="form-label">学校</text>
          <input class="form-input" v-model="form.school" placeholder="如：华南大学城" />
        </view>
        <view class="form-item">
          <text class="form-label">详细地址</text>
          <input class="form-input" v-model="form.detail" placeholder="如：6栋302室" />
        </view>
      </view>

      <view class="form-actions">
        <view class="btn-save" @click="saveForm">保存地址</view>
        <view class="btn-cancel" @click="showForm = false">取消</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 20rpx 24rpx 120rpx;
}

.empty {
  text-align: center;
  padding: 120rpx 0;
}

.empty-text {
  color: #bbb;
  font-size: 28rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 14rpx;
}

.addr-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1e1e1e;
}

.addr-phone {
  font-size: 26rpx;
  color: #666;
}

.default-tag {
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  background: #159d8a;
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
}

.addr-detail {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 18rpx;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 18rpx;
}

.action-left {
  display: flex;
  align-items: center;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.check-box {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 3rpx solid #ccc;
}

.check-box.checked {
  border-color: #159d8a;
  background: #159d8a;
}

.check-label {
  font-size: 24rpx;
  color: #666;
}

.action-right {
  display: flex;
  gap: 28rpx;
}

.action-link {
  font-size: 24rpx;
  color: #409eff;
}

.action-link.danger {
  color: #f56c6c;
}

.add-btn {
  margin-top: 30rpx;
  background: #159d8a;
  border-radius: 999rpx;
  padding: 24rpx 0;
  text-align: center;
}

.add-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

/* ── 表单 ── */
.form-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 140rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #1e1e1e;
}

.form-actions {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn-save {
  background: #159d8a;
  border-radius: 999rpx;
  padding: 24rpx 0;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.btn-cancel {
  background: #fff;
  border-radius: 999rpx;
  padding: 24rpx 0;
  text-align: center;
  color: #666;
  font-size: 28rpx;
  border: 2rpx solid #ddd;
}
</style>
