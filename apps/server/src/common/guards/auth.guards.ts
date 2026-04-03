import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { DataStoreService } from "../../database/data-store.service";

function extractToken(header?: string) {
  if (!header) return "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : "";
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly store: DataStoreService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = extractToken(request.headers.authorization);
    const state = await this.store.getState();
    const session = state.sessions.find(
        (item) =>
          item.token === token &&
          item.role === "admin" &&
          new Date(item.expiresAt).getTime() > Date.now(),
      );

    if (!session) {
      throw new UnauthorizedException("管理员登录已过期，请重新登录");
    }

    request.session = session;
    return true;
  }
}

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly store: DataStoreService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = extractToken(request.headers.authorization);
    const state = await this.store.getState();
    const session = state.sessions.find(
        (item) =>
          item.token === token &&
          item.role === "user" &&
          new Date(item.expiresAt).getTime() > Date.now(),
      );

    if (!session) {
      throw new UnauthorizedException("登录已过期，请重新进入小程序");
    }

    request.session = session;
    return true;
  }
}
