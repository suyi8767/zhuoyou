import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { DataStoreService } from "../../database/data-store.service";
import type { Session } from "../../database/models";
import { calculatePreview, createOrderRecord } from "./order.utils";

@Injectable()
export class AppService {
  constructor(private readonly store: DataStoreService) {}

  getHome() {
    const state = this.store.getState();
    return {
      banners: state.banners
        .filter((item) => item.enabled)
        .sort((a, b) => a.sort - b.sort),
      categories: [...state.categories].sort((a, b) => a.sort - b.sort),
      featuredGames: state.games.filter(
        (item) => item.featured && item.status === "published",
      ),
      homeConfig: {
        title: "大学城桌游租赁",
        subtitle: "蓝绿青春风，一键预约桌游上门",
        miniAdminEnabled: state.settings.miniAdminEnabled,
      },
    };
  }

  getSchools() {
    return this.store.getState().schools.filter((item) => item.isActive);
  }

  getDeliverySlots() {
    return this.store.getState().deliverySlots.filter((item) => item.enabled);
  }

  getCoupons() {
    return this.store.getState().coupons.filter((item) => item.enabled);
  }

  getGames(categoryId?: string) {
    const games = this.store
      .getState()
      .games.filter((item) => item.status === "published");
    return categoryId
      ? games.filter((item) => item.categoryId === categoryId)
      : games;
  }

  getGameDetail(id: string) {
    const state = this.store.getState();
    const game = state.games.find((item) => item.id === id);
    if (!game) {
      throw new NotFoundException("桌游不存在");
    }
    const category = state.categories.find((item) => item.id === game.categoryId);
    return {
      ...game,
      categoryName: category?.name ?? "未分类",
    };
  }

  previewOrder(input: {
    gameId: string;
    schoolId: string;
    deliverySlotId: string;
    rentalStartDate: string;
    rentalEndDate: string;
    contactName: string;
    contactPhone: string;
    addressDetail: string;
    couponCode?: string;
  }) {
    const state = this.store.getState();
    const game = state.games.find((item) => item.id === input.gameId);
    if (!game) {
      throw new NotFoundException("桌游不存在");
    }
    const school = state.schools.find((item) => item.id === input.schoolId);
    const slot = state.deliverySlots.find((item) => item.id === input.deliverySlotId);
    const coupon = input.couponCode
      ? state.coupons.find((item) => item.code === input.couponCode)
      : undefined;

    const preview = calculatePreview({
      game,
      school,
      slot,
      coupon,
      rentalStartDate: input.rentalStartDate,
      rentalEndDate: input.rentalEndDate,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      addressDetail: input.addressDetail,
    });

    return {
      ...preview,
      gameName: game.name,
      schoolName: school?.name ?? "",
      deliverySlotLabel: slot ? `${slot.label} ${slot.timeRange}` : "",
      couponCode: coupon?.code,
    };
  }

  createOrder(
    session: Session,
    input: {
      gameId: string;
      schoolId: string;
      deliverySlotId: string;
      rentalStartDate: string;
      rentalEndDate: string;
      contactName: string;
      contactPhone: string;
      addressDetail: string;
      couponCode?: string;
    },
  ) {
    const state = this.store.getState();
    const user = state.users.find((item) => item.id === session.userId);
    const game = state.games.find((item) => item.id === input.gameId);
    const school = state.schools.find((item) => item.id === input.schoolId);
    const slot = state.deliverySlots.find((item) => item.id === input.deliverySlotId);
    const coupon = input.couponCode
      ? state.coupons.find((item) => item.code === input.couponCode)
      : undefined;

    if (!user || !game || !school || !slot) {
      throw new BadRequestException("下单信息不完整，请刷新后重试");
    }

    const preview = calculatePreview({
      game,
      school,
      slot,
      coupon,
      rentalStartDate: input.rentalStartDate,
      rentalEndDate: input.rentalEndDate,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      addressDetail: input.addressDetail,
    });

    const order = createOrderRecord({
      userId: user.id,
      game,
      school,
      slot,
      rentalStartDate: input.rentalStartDate,
      rentalEndDate: input.rentalEndDate,
      addressDetail: input.addressDetail,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      couponCode: coupon?.code,
      settings: state.settings,
      preview,
    });

    this.store.update((nextState) => {
      nextState.orders.unshift(order);
      const targetGame = nextState.games.find((item) => item.id === game.id);
      if (targetGame) {
        targetGame.stock -= 1;
      }
      const targetUser = nextState.users.find((item) => item.id === user.id);
      if (targetUser) {
        targetUser.recentContactName = input.contactName;
        targetUser.recentContactPhone = input.contactPhone;
      }
    });

    return order;
  }

  getOrders(session: Session) {
    return this.store
      .getState()
      .orders.filter((item) => item.userId === session.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getOrderDetail(session: Session, id: string) {
    const order = this.store
      .getState()
      .orders.find((item) => item.id === id && item.userId === session.userId);
    if (!order) {
      throw new NotFoundException("订单不存在");
    }
    return order;
  }

  mockPay(
    session: Session,
    input: { orderId: string; outcome?: "success" | "fail" | "cancel" },
  ) {
    const state = this.store.getState();
    const order = state.orders.find(
      (item) => item.id === input.orderId && item.userId === session.userId,
    );
    if (!order) {
      throw new NotFoundException("订单不存在");
    }
    if (state.settings.paymentMode !== "mock") {
      throw new BadRequestException("当前未启用模拟支付");
    }

    const payment =
      state.payments.find((item) => item.orderId === order.id) ??
      {
        id: uuid(),
        orderId: order.id,
        orderNo: order.orderNo,
        provider: "mock" as const,
        amount: order.totalAmount,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

    const outcome = input.outcome ?? "success";
    const status =
      outcome === "success"
        ? "paid"
        : outcome === "fail"
          ? "failed"
          : "cancelled";

    this.store.update((nextState) => {
      const targetOrder = nextState.orders.find((item) => item.id === order.id);
      if (targetOrder) {
        targetOrder.paymentStatus = status;
        targetOrder.updatedAt = new Date().toISOString();
      }

      const existingPayment = nextState.payments.find((item) => item.orderId === order.id);
      if (existingPayment) {
        existingPayment.status = status;
        existingPayment.updatedAt = new Date().toISOString();
      } else {
        nextState.payments.unshift({
          ...payment,
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    return {
      orderId: order.id,
      paymentStatus: status,
      message:
        status === "paid"
          ? "模拟支付成功"
          : status === "failed"
            ? "模拟支付失败"
            : "模拟支付已取消",
    };
  }
}

