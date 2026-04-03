import { Body, Controller, Post } from "@nestjs/common";
import { IsOptional, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";

class SilentLoginDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

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
  wechatSilentLogin(@Body() body: SilentLoginDto) {
    return this.authService.loginUser(body.code, body.nickname);
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
