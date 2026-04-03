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

  async getDashboard() {
    const state = await this.store.getState();
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

  async list(entity: EntityName) {
    const state = await this.store.getState();
    return [...state[entity]];
  }

  async createBanner(payload: Omit<Banner, "id">) {
    return this.createEntity("banners", payload);
  }

  async updateBanner(id: string, payload: Partial<Omit<Banner, "id">>) {
    return this.updateEntity("banners", id, payload);
  }

  async createSchool(payload: Omit<School, "id">) {
    return this.createEntity("schools", payload);
  }

  async updateSchool(id: string, payload: Partial<Omit<School, "id">>) {
    return this.updateEntity("schools", id, payload);
  }

  async createCategory(payload: Omit<BoardGameCategory, "id">) {
    return this.createEntity("categories", payload);
  }

  async updateCategory(
    id: string,
    payload: Partial<Omit<BoardGameCategory, "id">>,
  ) {
    return this.updateEntity("categories", id, payload);
  }

  async createGame(payload: Omit<BoardGame, "id">) {
    return this.createEntity("games", payload);
  }

  async updateGame(id: string, payload: Partial<Omit<BoardGame, "id">>) {
    return this.updateEntity("games", id, payload);
  }

  async createCoupon(payload: Omit<Coupon, "id">) {
    return this.createEntity("coupons", payload);
  }

  async updateCoupon(id: string, payload: Partial<Omit<Coupon, "id">>) {
    return this.updateEntity("coupons", id, payload);
  }

  async removeEntity(entity: EntityName, id: string) {
    await this.ensureExists(entity, id);
    await this.store.update((state) => {
      state[entity] = state[entity].filter((item) => item.id !== id) as never;
    });
    return { id };
  }

  async getOrders() {
    const state = await this.store.getState();
    return state.orders.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateOrderStatus(
    id: string,
    payload: {
      acceptStatus?: "pending" | "confirmed" | "rejected";
      deliveryStatus?: DeliveryStatus;
      paymentStatus?: "pending" | "paid" | "failed" | "cancelled";
    },
  ) {
    const state = await this.store.getState();
    const order = state.orders.find((item) => item.id === id);
    if (!order) {
      throw new NotFoundException("订单不存在");
    }
    await this.store.update((nextState) => {
      const target = nextState.orders.find((item) => item.id === id);
      if (target) {
        Object.assign(target, payload, { updatedAt: new Date().toISOString() });
      }
    });
    const nextState = await this.store.getState();
    return nextState.orders.find((item) => item.id === id);
  }

  async getUsers() {
    const state = await this.store.getState();
    return state.users;
  }

  async getSettings() {
    const state = await this.store.getState();
    return state.settings;
  }

  async updateSettings(payload: Partial<SystemSetting>) {
    await this.store.update((state) => {
      state.settings = {
        ...state.settings,
        ...payload,
      };
    });
    const nextState = await this.store.getState();
    return nextState.settings;
  }

  async getReportsOverview() {
    const state = await this.store.getState();
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

  private async createEntity(entity: EntityName, payload: object) {
    const record = { id: uuid(), ...payload };
    await this.store.update((state) => {
      (state[entity] as Array<{ id: string }>).unshift(record as never);
    });
    return record;
  }

  private async updateEntity(entity: EntityName, id: string, payload: object) {
    await this.ensureExists(entity, id);
    await this.store.update((state) => {
      const target = (state[entity] as Array<{ id: string }>).find(
        (item) => item.id === id,
      );
      if (target) {
        Object.assign(target, payload);
      }
    });
    const state = await this.store.getState();
    return (state[entity] as Array<{ id: string }>).find((item) => item.id === id);
  }

  private async ensureExists(entity: EntityName, id: string) {
    const state = await this.store.getState();
    const exists = (state[entity] as Array<{ id: string }>).some(
      (item) => item.id === id,
    );
    if (!exists) {
      throw new NotFoundException("数据不存在");
    }
  }
}
