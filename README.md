# 云小夏桌游租赁

前后端分离三端项目：

- `apps/server`: NestJS 后端服务，当前使用 MySQL 持久化应用状态
- `apps/admin`: Vue 3 + Element Plus Web 管理后台
- `apps/mini`: uni-app + Vue 3 微信小程序端

## 启动

```bash
npm install
npm --prefix apps/server install
npm --prefix apps/admin install
npm --prefix apps/mini install
```

### 1. 启动 MySQL

在本机准备一个可用的 MySQL 实例，并按下面环境变量配置：

```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=campus_boardgame_rental
```

可参考：

- `apps/server/.env.example`

### 2. 启动后端

```bash
npm run dev:server
```

### 3. 启动后台

```bash
npm run dev:admin
```

### 4. 启动小程序

使用 HBuilderX 打开：

- `apps/mini`

## 说明

- 后端默认监听 `http://localhost:3000`
- Web 后台默认通过 `VITE_API_BASE_URL` 访问后端，未配置时走 `http://localhost:3000`
- 小程序端默认通过 `apps/mini/config.ts` 中的 `API_BASE_URL` 访问后端
- 后端启动时会自动创建数据库和 `app_state` 表，并在首次启动时写入种子数据
