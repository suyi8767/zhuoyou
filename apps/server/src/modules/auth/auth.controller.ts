import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";

class AdminLoginDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/app/auth/wechat-silent")
  wechatSilentLogin(@Body() body: { code?: unknown; nickname?: unknown }) {
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const nickname =
      typeof body?.nickname === "string" ? body.nickname.trim() : undefined;

    if (!code) {
      throw new BadRequestException("缺少登录 code");
    }

    return this.authService.loginUser(code, nickname);
  }

  @Post("/admin/auth/login")
  adminLogin(@Body() body: AdminLoginDto) {
    return this.authService.loginAdmin(body.username, body.password);
  }

  @Post("/app/admin/login")
  miniAdminLogin(@Body() body: AdminLoginDto) {
    return this.authService.loginAdmin(body.username, body.password);
  }
}
