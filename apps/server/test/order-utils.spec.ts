import { describe, expect, it } from "vitest";
import { calculatePreview, calculateRentalDays } from "../src/modules/app/order.utils";

describe("order.utils", () => {
  it("calculates rental days inclusively", () => {
    expect(calculateRentalDays("2026-04-02", "2026-04-02")).toBe(1);
    expect(calculateRentalDays("2026-04-02", "2026-04-04")).toBe(3);
  });

  it("calculates rent + deposit - coupon", () => {
    const preview = calculatePreview({
      game: {
        id: "1",
        name: "阿瓦隆",
        coverImage: "",
        gallery: [],
        tags: [],
        categoryId: "1",
        dailyPrice: 20,
        deposit: 50,
        stock: 2,
        description: "",
        players: "",
        duration: "",
        status: "published",
        featured: true,
      },
      school: {
        id: "1",
        name: "同济大学",
        campus: "上海大学城",
        isActive: true,
        deliveryTips: "",
      },
      slot: {
        id: "1",
        label: "晚间配送",
        timeRange: "18:00-21:00",
        capacity: 10,
        enabled: true,
      },
      coupon: {
        id: "1",
        name: "新客券",
        code: "NEW20",
        amount: 20,
        minAmount: 80,
        enabled: true,
      },
      rentalStartDate: "2026-04-02",
      rentalEndDate: "2026-04-04",
      contactName: "张三",
      contactPhone: "13800138000",
      addressDetail: "A 区 2 栋 301",
    });

    expect(preview.rentalDays).toBe(3);
    expect(preview.rentSubtotal).toBe(60);
    expect(preview.deposit).toBe(50);
    expect(preview.discountAmount).toBe(20);
    expect(preview.totalAmount).toBe(90);
  });
});
