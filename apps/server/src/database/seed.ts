import { v4 as uuid } from "uuid";
import type { DashboardState } from "./models";

const now = () => new Date().toISOString();

export function createSeedData(): DashboardState {
  const categoryStrategy = uuid();
  const categoryParty = uuid();
  const schoolTongji = uuid();
  const schoolFudan = uuid();
  const slotEvening = uuid();
  const slotAfternoon = uuid();
  const gameCatan = uuid();
  const gameWerewolf = uuid();
  const gameAvalon = uuid();
  const gameTerraforming = uuid();
  const banner1 = uuid();
  const banner2 = uuid();
  const coupon1 = uuid();
  const admin1 = uuid();
  const createdAt = now();

  return {
    admins: [
      {
        id: admin1,
        username: "admin",
        password: "admin123",
        name: "青春运营官",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        createdAt,
      },
    ],
    users: [],
    sessions: [],
    schools: [
      {
        id: schoolTongji,
        name: "同济大学嘉定校区",
        campus: "上海大学城",
        isActive: true,
        deliveryTips: "南门、图书馆、生活区都可配送",
      },
      {
        id: schoolFudan,
        name: "复旦大学江湾校区",
        campus: "上海大学城",
        isActive: true,
        deliveryTips: "教学楼门口和宿舍楼下均支持送达",
      },
    ],
    categories: [
      {
        id: categoryStrategy,
        name: "策略烧脑",
        description: "适合 2-5 人沉浸式对局",
        sort: 1,
        icon: "brain",
      },
      {
        id: categoryParty,
        name: "聚会欢乐",
        description: "社团、寝室、联谊都好玩",
        sort: 2,
        icon: "sparkles",
      },
    ],
    games: [
      {
        id: gameCatan,
        name: "卡坦岛",
        coverImage:
          "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1606503153255-59d8b8b2b2d6?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
        ],
        tags: ["经典策略", "资源运营", "新手友好"],
        categoryId: categoryStrategy,
        dailyPrice: 18,
        deposit: 60,
        stock: 6,
        description: "经典贸易与建设桌游，节奏轻快，适合好友开局。",
        players: "3-4 人",
        duration: "60-90 分钟",
        status: "published",
        featured: true,
      },
      {
        id: gameWerewolf,
        name: "狼人杀",
        coverImage:
          "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?auto=format&fit=crop&w=900&q=80",
        ],
        tags: ["社交推理", "多人热场", "聚会必备"],
        categoryId: categoryParty,
        dailyPrice: 12,
        deposit: 40,
        stock: 12,
        description: "大学城聚会热门款，快速组局、氛围感很强。",
        players: "6-12 人",
        duration: "40-120 分钟",
        status: "published",
        featured: true,
      },
      {
        id: gameAvalon,
        name: "阿瓦隆",
        coverImage:
          "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
        ],
        tags: ["阵营推理", "社团热门", "口碑款"],
        categoryId: categoryParty,
        dailyPrice: 15,
        deposit: 50,
        stock: 8,
        description: "高互动、强推理、适合熟人局的经典阵营桌游。",
        players: "5-10 人",
        duration: "30-60 分钟",
        status: "published",
        featured: true,
      },
      {
        id: gameTerraforming,
        name: "火星开发",
        coverImage:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
        ],
        tags: ["硬核策略", "长局沉浸", "社团珍藏"],
        categoryId: categoryStrategy,
        dailyPrice: 28,
        deposit: 100,
        stock: 3,
        description: "适合重策玩家，经营与引擎构筑体验都很扎实。",
        players: "1-5 人",
        duration: "120-180 分钟",
        status: "published",
        featured: false,
      },
    ],
    banners: [
      {
        id: banner1,
        title: "大学城桌游夜",
        subtitle: "蓝绿青春风限时精选，宿舍社团聚会一键预约",
        image:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
        sort: 1,
        enabled: true,
      },
      {
        id: banner2,
        title: "热卖新手友好局",
        subtitle: "从卡坦岛到阿瓦隆，随时下单、按天租赁",
        image:
          "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
        sort: 2,
        enabled: true,
      },
    ],
    deliverySlots: [
      {
        id: slotAfternoon,
        label: "午后配送",
        timeRange: "13:00-16:00",
        capacity: 10,
        enabled: true,
      },
      {
        id: slotEvening,
        label: "晚间配送",
        timeRange: "18:00-21:00",
        capacity: 15,
        enabled: true,
      },
    ],
    coupons: [
      {
        id: coupon1,
        name: "新生夜场券",
        code: "CAMPUS20",
        amount: 20,
        minAmount: 88,
        enabled: true,
      },
    ],
    orders: [],
    payments: [],
    settings: {
      orderAcceptMode: "manual",
      paymentMode: "mock",
      miniAdminEnabled: true,
    },
  };
}
