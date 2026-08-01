import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "node:fs";
import * as path from "node:path";
import { v4 as uuid } from "uuid";
import { AdminAuthGuard } from "../../common/guards/auth.guards";
import { AdminService } from "./admin.service";

function resolveUploadsDir() {
  const cwd = process.cwd();
  if (cwd.endsWith(path.join("apps", "server"))) {
    return path.join(cwd, "uploads");
  }
  return path.join(cwd, "apps", "server", "uploads");
}

class BannerDto {
  @IsString()
  title!: string;

  @IsString()
  subtitle!: string;

  @IsString()
  image!: string;

  @IsNumber()
  sort!: number;

  @IsBoolean()
  enabled!: boolean;
}

class SchoolDto {
  @IsString()
  name!: string;

  @IsString()
  campus!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  deliveryTips!: string;
}

class CategoryDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  sort!: number;

  @IsString()
  icon!: string;
}

class GameDto {
  @IsString()
  name!: string;

  @IsString()
  coverImage!: string;

  @IsArray()
  gallery!: string[];

  @IsArray()
  tags!: string[];

  @IsString()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  dailyPrice!: number;

  @IsNumber()
  @Min(0)
  deposit!: number;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsString()
  description!: string;

  @IsString()
  players!: string;

  @IsString()
  duration!: string;

  @IsString()
  status!: "draft" | "published" | "offline";

  @IsBoolean()
  featured!: boolean;
}

class CouponDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  minAmount!: number;

  @IsBoolean()
  enabled!: boolean;
}

class SettingsDto {
  @IsOptional()
  @IsString()
  orderAcceptMode?: "manual" | "auto";

  @IsOptional()
  @IsString()
  paymentMode?: "mock" | "wechat";

  @IsOptional()
  @IsBoolean()
  miniAdminEnabled?: boolean;
}

class OrderStatusDto {
  @IsOptional()
  @IsString()
  acceptStatus?: "pending" | "confirmed" | "rejected";

  @IsOptional()
  @IsString()
  deliveryStatus?: "pending" | "delivering" | "delivered" | "returned";

  @IsOptional()
  @IsString()
  paymentStatus?: "pending" | "paid" | "failed" | "cancelled";

  @IsOptional()
  @IsString()
  depositRefundStatus?: "none" | "pending" | "refunded";
}

@Controller("/admin")
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("/uploads/image")
  @UseInterceptors(FileInterceptor("file"))
  uploadImage(@UploadedFile() file: any, @Req() request: any) {
    if (!file) {
      throw new BadRequestException("请选择图片文件");
    }
    if (!String(file.mimetype || "").startsWith("image/")) {
      throw new BadRequestException("仅支持上传图片文件");
    }

    const uploadsDir = resolveUploadsDir();
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file.originalname || "") || ".png";
    const fileName = `${Date.now()}-${uuid()}${ext}`;
    const targetPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(targetPath, file.buffer);

    const protocol =
      request.headers["x-forwarded-proto"] ||
      request.protocol ||
      "http";
    const host = request.headers.host;

    return {
      fileName,
      url: `${protocol}://${host}/uploads/${fileName}`,
    };
  }

  @Get("/dashboard")
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get("/banners")
  getBanners() {
    return this.adminService.list("banners");
  }

  @Post("/banners")
  createBanner(@Body() body: BannerDto) {
    return this.adminService.createBanner(body);
  }

  @Put("/banners/:id")
  updateBanner(@Param("id") id: string, @Body() body: Partial<BannerDto>) {
    return this.adminService.updateBanner(id, body);
  }

  @Delete("/banners/:id")
  deleteBanner(@Param("id") id: string) {
    return this.adminService.removeEntity("banners", id);
  }

  @Get("/schools")
  getSchools() {
    return this.adminService.list("schools");
  }

  @Post("/schools")
  createSchool(@Body() body: SchoolDto) {
    return this.adminService.createSchool(body);
  }

  @Put("/schools/:id")
  updateSchool(@Param("id") id: string, @Body() body: Partial<SchoolDto>) {
    return this.adminService.updateSchool(id, body);
  }

  @Delete("/schools/:id")
  deleteSchool(@Param("id") id: string) {
    return this.adminService.removeEntity("schools", id);
  }

  @Get("/categories")
  getCategories() {
    return this.adminService.list("categories");
  }

  @Post("/categories")
  createCategory(@Body() body: CategoryDto) {
    return this.adminService.createCategory(body);
  }

  @Put("/categories/:id")
  updateCategory(@Param("id") id: string, @Body() body: Partial<CategoryDto>) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete("/categories/:id")
  deleteCategory(@Param("id") id: string) {
    return this.adminService.removeEntity("categories", id);
  }

  @Get("/games")
  getGames() {
    return this.adminService.list("games");
  }

  @Post("/games")
  createGame(@Body() body: GameDto) {
    return this.adminService.createGame(body);
  }

  @Put("/games/:id")
  updateGame(@Param("id") id: string, @Body() body: Partial<GameDto>) {
    return this.adminService.updateGame(id, body);
  }

  @Delete("/games/:id")
  deleteGame(@Param("id") id: string) {
    return this.adminService.removeEntity("games", id);
  }

  @Get("/orders")
  getOrders() {
    return this.adminService.getOrders();
  }

  @Patch("/orders/:id/status")
  updateOrderStatus(@Param("id") id: string, @Body() body: OrderStatusDto) {
    return this.adminService.updateOrderStatus(id, body);
  }

  @Post("/orders/:id/refund-deposit")
  refundDeposit(@Param("id") id: string) {
    return this.adminService.refundDeposit(id);
  }

  @Get("/users")
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get("/coupons")
  getCoupons() {
    return this.adminService.list("coupons");
  }

  @Post("/coupons")
  createCoupon(@Body() body: CouponDto) {
    return this.adminService.createCoupon(body);
  }

  @Put("/coupons/:id")
  updateCoupon(@Param("id") id: string, @Body() body: Partial<CouponDto>) {
    return this.adminService.updateCoupon(id, body);
  }

  @Delete("/coupons/:id")
  deleteCoupon(@Param("id") id: string) {
    return this.adminService.removeEntity("coupons", id);
  }

  @Get("/settings")
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put("/settings")
  updateSettings(@Body() body: SettingsDto) {
    return this.adminService.updateSettings(body);
  }

  @Get("/reports/overview")
  getReportsOverview() {
    return this.adminService.getReportsOverview();
  }
}
