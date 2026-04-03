import { Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { DataStoreService } from "../../database/data-store.service";
import type {
  Banner,
  BoardGame,
  BoardGameCategory,
  Coupon,
  DeliveryStatus,
  School,
  SystemSetting,
} from "../../database/models";

type EntityName = "banners" | "schools" | "categories" | "games" | "coupons";

@Injectable()
export class AdminService {
  constructor(private readonly store: DataStoreService) {}

  getDashboard() {
    const state = this.store.getState();
    const revenue = state.orders
      .filter((item) => item.paymentStatus === "paid")
      .reduce((sum, item) => sum + item.totalAmount, 0);
    return {
      overview: {
        totalGames: state.games.length,
        totalUsers: state.users.length,
        totalOrders: state.orders.length,
        paidRevenue: revenue,
      },
      latestOrders: state.orders.slice(0, 5),
      settings: state.settings,
    };
  }

  list(entity: EntityName) {
    return [...this.store.getState()[entity]];
  }

  createBanner(payload: Omit<Banner, "id">) {
    return this.createEntity("banners", payload);
  }

  updateBanner(id: string, payload: Partial<Omit<Banner, "id">>) {
    return this.updateEntity("banners", id, payload);
  }

  createSchool(payload: Omit<School, "id">) {
    return this.createEntity("schools", payload);
  }

  updateSchool(id: string, payload: Partial<Omit<School, "id">>) {
    return this.updateEntity("schools", id, payload);
  }

  createCategory(payload: Omit<BoardGameCategory, "id">) {
    return this.createEntity("categories", payload);
  }

  updateCategory(id: string, payload: Partial<Omit<BoardGameCategory, "id">>) {
    return this.updateEntity("categories", id, payload);
  }

  createGame(payload: Omit<BoardGame, "id">) {
    return this.createEntity("games", payload);
  }

  updateGame(id: string, payload: Partial<Omit<BoardGame, "id">>) {
    return this.updateEntity("games", id, payload);
  }

  createCoupon(payload: Omit<Coupon, "id">) {
    return this.createEntity("coupons", payload);
  }

  updateCoupon(id: string, payload: Partial<Omit<Coupon, "id">>) {
    return this.updateEntity("coupons", id, payload);
  }

  removeEntity(entity: EntityName, id: string) {
    this.ensureExists(entity, id);
    this.store.update((state) => {
      state[entity] = state[entity].filter((item) => item.id !== id) as never;
    });
    return { id };
  }

  getOrders() {
    return this.store
      .getState()
      .orders.slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  updateOrderStatus(
    id: string,
    payload: {
      acceptStatus?: "pending" | "confirmed" | "rejected";
      deliveryStatus?: DeliveryStatus;
      paymentStatus?: "pending" | "paid" | "failed" | "cancelled";
    },
  ) {
    const order = this.store.getState().orders.find((item) => item.id === id);
    if (!order) {
      throw new NotFoundException("订单不存在");
    }
    this.store.update((state) => {
      const target = state.orders.find((item) => item.id === id);
      if (target) {
        Object.assign(target, payload, { updatedAt: new Date().toISOString() });
      }
    });
    return this.store.getState().orders.find((item) => item.id === id);
  }

  getUsers() {
    return this.store.getState().users;
  }

  getSettings() {
    return this.store.getState().settings;
  }

  updateSettings(payload: Partial<SystemSetting>) {
    this.store.update((state) => {
      state.settings = {
        ...state.settings,
        ...payload,
      };
    });
    return this.store.getState().settings;
  }

  getReportsOverview() {
    const state = this.store.getState();
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = state.orders.filter((item) =>
      item.createdAt.startsWith(today),
    ).length;
    const schoolStats = state.schools.map((school) => ({
      schoolId: school.id,
      schoolName: school.name,
      orderCount: state.orders.filter((item) => item.schoolId === school.id).length,
    }));
    const gameStats = state.games.map((game) => ({
      gameId: game.id,
      gameName: game.name,
      orderCount: state.orders.filter((item) =>
        item.items.some((orderItem) => orderItem.gameId === game.id),
      ).length,
    }));

    return {
      todayOrders,
      totalRevenue: state.orders
        .filter((item) => item.paymentStatus === "paid")
        .reduce((sum, item) => sum + item.totalAmount, 0),
      schoolStats,
      gameStats,
    };
  }

  private createEntity(entity: EntityName, payload: object) {
    const record = { id: uuid(), ...payload };
    this.store.update((state) => {
      (state[entity] as Array<{ id: string }>).unshift(record as never);
    });
    return record;
  }

  private updateEntity(entity: EntityName, id: string, payload: object) {
    this.ensureExists(entity, id);
    this.store.update((state) => {
      const target = (state[entity] as Array<{ id: string }>).find(
        (item) => item.id === id,
      );
      if (target) {
        Object.assign(target, payload);
      }
    });
    return (this.store.getState()[entity] as Array<{ id: string }>).find(
      (item) => item.id === id,
    );
  }

  private ensureExists(entity: EntityName, id: string) {
    const exists = (this.store.getState()[entity] as Array<{ id: string }>).some(
      (item) => item.id === id,
    );
    if (!exists) {
      throw new NotFoundException("数据不存在");
    }
  }
}

