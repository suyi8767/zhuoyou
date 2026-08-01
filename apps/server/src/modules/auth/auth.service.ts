import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import * as bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { DataStoreService } from "../../database/data-store.service";

function isBcryptHash(value: string) {
  return /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

async function matchPassword(raw: string, stored: string) {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(raw, stored);
  }
  return stored === raw;
}

@Injectable()
export class AuthService {
  constructor(private readonly store: DataStoreService) {}

  async loginUser(code: string, nickname?: string) {
    const openId = code.trim() || `wx-${uuid()}`;
    const state = await this.store.getState();
    let user = state.users.find((item) => item.openId === openId);

    if (!user) {
      user = {
        id: uuid(),
        openId,
        nickname: nickname?.trim() || `校园玩家${state.users.length + 1}`,
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        recentContactName: "",
        recentContactPhone: "",
        createdAt: new Date().toISOString(),
      };

      await this.store.update((nextState) => {
        nextState.users.unshift(user!);
      });
    }

    const token = await this.createSession(user.id, "user");
    return { token, user };
  }

  async loginAdmin(username: string, password: string) {
    const state = await this.store.getState();
    const inputUser = username.trim();
    const inputPass = password.trim();
    let matched: (typeof state.admins)[number] | undefined;

    for (const item of state.admins) {
      if (item.username !== inputUser) continue;
      if (await matchPassword(inputPass, item.password)) {
        matched = item;
        break;
      }
    }

    if (!matched) {
      throw new UnauthorizedException("账号或密码不正确");
    }

    const token = await this.createSession(matched.id, "admin");
    return { token, admin: matched };
  }

  async getAdminProfile(adminId: string) {
    const state = await this.store.getState();
    const admin = state.admins.find((item) => item.id === adminId);

    if (!admin) {
      throw new NotFoundException("管理员不存在");
    }

    return admin;
  }

  private async createSession(userId: string, role: "user" | "admin") {
    const token = randomBytes(24).toString("hex");
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await this.store.update((state) => {
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
