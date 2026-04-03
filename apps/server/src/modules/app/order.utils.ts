import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { v4 as uuid } from "uuid";
import type {
  BoardGame,
  Coupon,
  DeliverySlot,
  Order,
  School,
  SystemSetting,
} from "../../database/models";

export interface PreviewParams {
  game: BoardGame;
  school: School | undefined;
  slot: DeliverySlot | undefined;
  coupon: Coupon | undefined;
  rentalStartDate: string;
  rentalEndDate: string;
  contactName: string;
  contactPhone: string;
  addressDetail: string;
}

export function calculateRentalDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new BadRequestException("请正确选择租赁日期");
  }
  if (end.getTime() < start.getTime()) {
    throw new BadRequestException("结束日期不能早于开始日期");
  }
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

export function calculatePreview(params: PreviewParams) {
  const {
    game,
    school,
    slot,
    coupon,
    rentalStartDate,
    rentalEndDate,
    contactName,
    contactPhone,
    addressDetail,
  } = params;

  if (!school || !school.isActive) {
    throw new NotFoundException("学校不存在或暂不可配送");
  }
  if (!slot || !slot.enabled) {
    throw new NotFoundException("预约时段不存在或未开放");
  }
  if (!contactName.trim() || !contactPhone.trim() || !addressDetail.trim()) {
    throw new BadRequestException("请完整填写联系人、手机号和详细地址");
  }
  if (game.status !== "published") {
    throw new BadRequestException("该桌游当前暂不可租赁");
  }
  if (game.stock <= 0) {
    throw new ConflictException("库存不足，请稍后再试");
  }

  const rentalDays = calculateRentalDays(rentalStartDate, rentalEndDate);
  const rentSubtotal = rentalDays * game.dailyPrice;
  const deposit = game.deposit;
  const discountAmount =
    coupon && coupon.enabled && rentSubtotal + deposit >= coupon.minAmount
      ? coupon.amount
      : 0;
  const totalAmount = Math.max(rentSubtotal + deposit - discountAmount, 0);

  return {
    rentalDays,
    rentSubtotal,
    deposit,
    discountAmount,
    totalAmount,
  };
}

export function createOrderRecord(input: {
  userId: string;
  game: BoardGame;
  school: School;
  slot: DeliverySlot;
  rentalStartDate: string;
  rentalEndDate: string;
  addressDetail: string;
  contactName: string;
  contactPhone: string;
  couponCode?: string;
  settings: SystemSetting;
  preview: ReturnType<typeof calculatePreview>;
}): Order {
  const now = new Date().toISOString();
  const acceptStatus =
    input.settings.orderAcceptMode === "auto" ? "confirmed" : "pending";

  return {
    id: uuid(),
    orderNo: `BG${Date.now().toString().slice(-10)}`,
    userId: input.userId,
    schoolId: input.school.id,
    schoolName: input.school.name,
    addressDetail: input.addressDetail,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    rentalStartDate: input.rentalStartDate,
    rentalEndDate: input.rentalEndDate,
    deliverySlotId: input.slot.id,
    deliverySlotLabel: `${input.slot.label} ${input.slot.timeRange}`,
    rentalDays: input.preview.rentalDays,
    rentSubtotal: input.preview.rentSubtotal,
    deposit: input.preview.deposit,
    discountAmount: input.preview.discountAmount,
    totalAmount: input.preview.totalAmount,
    paymentStatus: "pending",
    acceptStatus,
    deliveryStatus: "pending",
    couponCode: input.couponCode,
    items: [
      {
        gameId: input.game.id,
        name: input.game.name,
        coverImage: input.game.coverImage,
        dailyPrice: input.game.dailyPrice,
        deposit: input.game.deposit,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

