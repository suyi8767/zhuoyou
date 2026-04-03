# 大学城桌游租赁小程序

前后端分离三端项目：

- `apps/server`: NestJS 风格后端服务，内置开发用文件数据源，并预留 MySQL/Redis 迁移边界
- `apps/admin`: Vue 3 + Element Plus Web 后台
- `apps/mini`: uni-app + Vue 3 微信小程序端

## 启动

```bash
npm install
npm --prefix apps/mini install
npm run dev:server
npm run dev:admin
npm run dev:mini
```

## 说明

- 后端默认监听 `http://localhost:3000`
- Web 后台默认通过 `VITE_API_BASE_URL` 访问后端，未配置时走 `http://localhost:3000`
- 小程序端默认通过 `src/config.ts` 中的 `API_BASE_URL` 访问后端
- 开发态后端使用 `apps/server/data/mock-db.json` 持久化，便于本地直接体验完整链路
- `apps/mini` 为独立 npm 项目，便于 HBuilderX 直接识别本地编译器依赖
