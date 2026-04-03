import { Module } from "@nestjs/common";
import { AdminAuthGuard, UserAuthGuard } from "./common/guards/auth.guards";
import { DataStoreService } from "./database/data-store.service";
import { AdminController } from "./modules/admin/admin.controller";
import { AdminService } from "./modules/admin/admin.service";
import { AppController } from "./modules/app/app.controller";
import { AppService } from "./modules/app/app.service";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";

@Module({
  controllers: [AuthController, AppController, AdminController],
  providers: [
    DataStoreService,
    AuthService,
    AppService,
    AdminService,
    AdminAuthGuard,
    UserAuthGuard,
  ],
})
export class AppModule {}

