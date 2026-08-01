export type UserRole = "user" | "admin";

export type OrderAcceptMode = "manual" | "auto";
export type PaymentMode = "mock" | "wechat";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type OrderAcceptStatus = "pending" | "confirmed" | "rejected";
export type DeliveryStatus = "pending" | "delivering" | "delivered" | "returned";
export type DepositRefundStatus = "none" | "pending" | "refunded";

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export interface User {
  id: string;
  openId: string;
  nickname: string;
  avatar: string;
  recentContactName: string;
  recentContactPhone: string;
  createdAt: string;
}

export interface Session {
  id: string;
  token: string;
  role: UserRole;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface School {
  id: string;
  name: string;
  campus: string;
  isActive: boolean;
  deliveryTips: string;
}

export interface BoardGameCategory {
  id: string;
  name: string;
  description: string;
  sort: number;
  icon: string;
}

export interface BoardGame {
  id: string;
  name: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  categoryId: string;
  dailyPrice: number;
  deposit: number;
  stock: number;
  description: string;
  players: string;
  duration: string;
  status: "draft" | "published" | "offline";
  featured: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  sort: number;
  enabled: boolean;
}

export interface DeliverySlot {
  id: string;
  label: string;
  timeRange: string;
  capacity: number;
  enabled: boolean;
}

export interface Coupon {
  id: string;
  name: string;
  code: string;
  amount: number;
  minAmount: number;
  enabled: boolean;
}

export interface OrderItemSnapshot {
  gameId: string;
  name: string;
  coverImage: string;
  dailyPrice: number;
  deposit: number;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  schoolId: string;
  schoolName: string;
  addressDetail: string;
  contactName: string;
  contactPhone: string;
  rentalStartDate: string;
  rentalEndDate: string;
  deliverySlotId: string;
  deliverySlotLabel: string;
  rentalDays: number;
  rentSubtotal: number;
  deposit: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  acceptStatus: OrderAcceptStatus;
  deliveryStatus: DeliveryStatus;
  depositRefundStatus?: DepositRefundStatus;
  couponCode?: string;
  items: OrderItemSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNo: string;
  provider: PaymentMode;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  orderAcceptMode: OrderAcceptMode;
  paymentMode: PaymentMode;
  miniAdminEnabled: boolean;
}

export interface DashboardState {
  admins: AdminUser[];
  users: User[];
  sessions: Session[];
  schools: School[];
  categories: BoardGameCategory[];
  games: BoardGame[];
  banners: Banner[];
  deliverySlots: DeliverySlot[];
  coupons: Coupon[];
  orders: Order[];
  payments: PaymentRecord[];
  settings: SystemSetting;
}
