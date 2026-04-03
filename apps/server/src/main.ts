import "reflect-metadata";
import * as express from "express";
import * as fs from "node:fs";
import * as path from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

function resolveUploadsDir() {
  const cwd = process.cwd();
  if (cwd.endsWith(path.join("apps", "server"))) {
    return path.join(cwd, "uploads");
  }
  return path.join(cwd, "apps", "server", "uploads");
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadsDir = resolveUploadsDir();
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.enableCors();
  app.use("/uploads", express.static(uploadsDir));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(3000);
}

void bootstrap();
