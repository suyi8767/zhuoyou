import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Session } from "../../database/models";

export const CurrentSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session as Session | undefined;
  },
);

