import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { v4 as uuid } from "uuid";
import { DataStoreService } from "../../database/data-store.service";

@Injectable()
export class AuthService {
  constructor(private readonly store: DataStoreService) {}

  loginUser(code: string, nickname?: string) {
    const openId = code.trim() || `wx-${uuid()}`;
    let user = this.store.getState().users.find((item) => item.openId === openId);
    if (!user) {
      user = {
        id: uuid(),
        openId,
        nickname: nickname?.trim() || `校园玩家${this.store.getState().users.length + 1}`,
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        recentContactName: "",
        recentContactPhone: "",
        createdAt: new Date().toISOString(),
      };
      this.store.update((state) => {
        state.users.unshift(user!);
      });
    }
    const token = this.createSession(user.id, "user");
    return { token, user };
  }

  loginAdmin(username: string, password: string) {
    const admin = this.store
      .getState()
      .admins.find(
        (item) =>
          item.username === username.trim() && item.password === password.trim(),
      );
    if (!admin) {
      throw new UnauthorizedException("账号或密码不正确");
    }

    const token = this.createSession(admin.id, "admin");
    return { token, admin };
  }

  getAdminProfile(adminId: string) {
    const admin = this.store.getState().admins.find((item) => item.id === adminId);
    if (!admin) {
      throw new NotFoundException("管理员不存在");
    }
    return admin;
  }

  private createSession(userId: string, role: "user" | "admin") {
    const token = randomBytes(24).toString("hex");
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    this.store.update((state) => {
      state.sessions = state.sessions.filter(
        (item) => !(item.userId === userId && item.role === role),
      );
      state.sessions.unshift({
        id: uuid(),
        token,
        role,
        userId,
        createdAt,
        expiresAt,
      });
    });
    return token;
  }
}

