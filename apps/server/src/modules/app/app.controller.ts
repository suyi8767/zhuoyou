import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";
import { CurrentSession } from "../../common/decorators/current-session";
import { UserAuthGuard } from "../../common/guards/auth.guards";
import type { Session } from "../../database/models";
import { AppService } from "./app.service";

class OrderPreviewDto {
  @IsString()
  gameId!: string;

  @IsString()
  schoolId!: string;

  @IsString()
  deliverySlotId!: string;

  @IsString()
  rentalStartDate!: string;

  @IsString()
  rentalEndDate!: string;

  @IsString()
  @MinLength(1)
  contactName!: string;

  @IsPhoneNumber("CN")
  contactPhone!: string;

  @IsString()
  @MinLength(3)
  addressDetail!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

class MockPaymentDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsIn(["success", "fail", "cancel"])
  outcome?: "success" | "fail" | "cancel";
}

@Controller("/app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping")
  ping() {
    return { ok: true };
  }

  @Get("/home")
  getHome() {
    return this.appService.getHome();
  }

  @Get("/schools")
  getSchools() {
    return this.appService.getSchools();
  }

  @Get("/delivery-slots")
  getDeliverySlots() {
    return this.appService.getDeliverySlots();
  }

  @Get("/coupons")
  getCoupons() {
    return this.appService.getCoupons();
  }

  @Get("/games")
  getGames(@Query("categoryId") categoryId?: string) {
    return this.appService.getGames(categoryId);
  }

  @Get("/games/:id")
  getGameDetail(@Param("id") id: string) {
    return this.appService.getGameDetail(id);
  }

  @Post("/orders/preview")
  previewOrder(@Body() body: OrderPreviewDto) {
    return this.appService.previewOrder(body);
  }

  @Post("/orders")
  @UseGuards(UserAuthGuard)
  createOrder(@CurrentSession() session: Session, @Body() body: OrderPreviewDto) {
    return this.appService.createOrder(session, body);
  }

  @Get("/orders")
  @UseGuards(UserAuthGuard)
  getOrders(@CurrentSession() session: Session) {
    return this.appService.getOrders(session);
  }

  @Get("/orders/:id")
  @UseGuards(UserAuthGuard)
  getOrderDetail(@CurrentSession() session: Session, @Param("id") id: string) {
    return this.appService.getOrderDetail(session, id);
  }

  @Post("/payments/mock")
  @UseGuards(UserAuthGuard)
  mockPay(@CurrentSession() session: Session, @Body() body: MockPaymentDto) {
    return this.appService.mockPay(session, body);
  }
}
