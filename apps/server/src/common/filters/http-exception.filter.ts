import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        success: false,
        message: exception.message,
        error: exception.getResponse(),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.message : "Unknown exception",
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );
    try {
      const logPath = path.join(process.cwd(), "apps", "server", "runtime-error.log");
      const payload = [
        `\n[${new Date().toISOString()}]`,
        exception instanceof Error ? exception.message : "Unknown exception",
        exception instanceof Error ? exception.stack || "" : JSON.stringify(exception),
        "\n",
      ].join("\n");
      fs.appendFileSync(logPath, payload, "utf-8");
    } catch {}

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "服务器开小差了，请稍后再试",
      timestamp: new Date().toISOString(),
    });
  }
}
