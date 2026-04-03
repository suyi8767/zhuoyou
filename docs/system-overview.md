# 云小夏桌游租赁系统梳理

## 1. 系统定位

这是一个前后端分离的大学城桌游租赁系统，当前包含三端：

- 小程序端：`apps/mini`
- Web 管理后台：`apps/admin`
- 后端服务：`apps/server`

目标业务是：

- 用户在小程序浏览桌游
- 选择租赁日期、学校、配送时段并下单
- 后台管理商品、轮播、学校、订单、优惠券和系统配置

---

## 2. 当前目录结构

### 2.1 根目录

- `package.json`
  - 根脚本入口
  - 当前 workspace 仅包含 `apps/server` 和 `apps/admin`
- `README.md`
  - 目前存在编码问题，建议后续统一修正
- `docs/system-overview.md`
  - 当前系统说明文档

### 2.2 小程序端 `apps/mini`

关键文件：

- `pages.json`
  - 小程序页面声明与 tabBar 配置
- `manifest.json`
  - 小程序基础配置
- `main.ts`
  - uni-app 入口
- `api.ts`
  - 小程序请求封装
- `config.ts`
  - 后端接口地址配置
- `stores/session.ts`
  - 用户与管理员登录态管理

主要页面：

- `pages/index/index.vue`
  - 首页
- `pages/games/index.vue`
  - 桌游菜单页
- `pages/game-detail/index.vue`
  - 桌游详情页
- `pages/order-create/index.vue`
  - 下单页
- `pages/orders/index.vue`
  - 我的订单
- `pages/profile/index.vue`
  - 我的页面
- `pages/admin-login/index.vue`
  - 隐藏管理员入口登录
- `pages/admin-panel/index.vue`
  - 小程序轻量管理页

辅助页面：

- `pages/address/index.vue`
- `pages/coupons/index.vue`
- `pages/service/index.vue`
- `pages/about/index.vue`

静态资源：

- `static/banner-default.png`
  - 首页默认轮播图
- `icon-home.png`
- `icon-menu.png`
- `icon-orders.png`
- `icon-profile.png`
  - 根级 tabBar 图标资源

### 2.3 Web 后台 `apps/admin`

关键文件：

- `src/App.vue`
  - 当前后台主界面，承载登录页和后台工作台
- `src/stores/admin.ts`
  - 后台数据状态与接口调用
- `src/api/client.ts`
  - 管理后台请求封装
- `src/styles/theme.css`
  - 全局视觉变量

后台模块：

- 总览驾驶舱
- 轮播管理
- 学校管理
- 分类管理
- 桌游商品
- 订单管理
- 用户管理
- 营销优惠
- 经营报表
- 系统设置

### 2.4 后端 `apps/server`

关键文件：

- `src/main.ts`
  - Nest 启动入口
- `src/app.module.ts`
  - 模块注册
- `src/database/data-store.service.ts`
  - 当前开发态数据存储层
- `src/database/seed.ts`
  - 初始种子数据
- `src/modules/auth/auth.controller.ts`
  - 登录接口
- `src/modules/app/app.controller.ts`
  - 小程序端接口
- `src/modules/admin/admin.controller.ts`
  - 后台管理接口

当前数据持久化方式：

- 使用 MySQL 持久化应用状态
- 当前由 `DataStoreService` 负责连接 MySQL、自动建库建表，并在首次启动时写入种子数据

---

## 3. 三端关系

### 3.1 小程序端

小程序通过 `apps/mini/config.ts` 中的 `API_BASE_URL` 请求后端。

当前默认：

- `http://localhost:3000`

### 3.2 Web 后台

后台通过 `apps/admin/src/api/client.ts` 请求后端接口。

默认后端地址：

- `http://localhost:3000`

### 3.3 后端

后端负责：

- 小程序用户静默登录
- 首页数据、桌游列表、桌游详情
- 订单预览、创建订单、模拟支付
- 后台登录与后台管理数据

---

## 4. 当前已经具备的能力

### 4.1 小程序端

- 首页自定义头部与轮播区
- 首页商品分类入口
- 热租榜单区域
- 拼贴推荐区
- 搜索栏
- 桌游菜单页
- 桌游详情页
- 创建订单页
- 我的订单页
- 个人中心页
- 隐藏管理员入口
- 小程序轻量管理页

### 4.2 后台端

- 后台登录
- 总览看板
- 基础 CRUD 管理
- 订单状态更新
- 系统设置切换
- 后台图片傻瓜式上传
  - 轮播图支持直接选图上传
  - 桌游封面支持直接选图上传
  - 桌游详情图支持多图上传并自动回填

### 4.3 后端

已经可用接口包括：

- `POST /app/auth/wechat-silent`
- `GET /app/home`
- `GET /app/games`
- `GET /app/games/:id`
- `GET /app/schools`
- `GET /app/delivery-slots`
- `GET /app/coupons`
- `POST /app/orders/preview`
- `POST /app/orders`
- `GET /app/orders`
- `GET /app/orders/:id`
- `POST /app/payments/mock`
- `POST /admin/auth/login`
- 多组 `/admin/*` 管理接口

---

## 5. 当前数据流

### 5.1 首页

首页主要依赖：

- `/app/home`
- `/app/games`
- `/app/coupons`

当前逻辑已经调整为：

- 后台真实数据优先
- 当后台轮播为空时，才使用默认本地轮播图兜底

### 5.2 菜单页

菜单页依赖：

- `/app/home` 获取分类
- `/app/games?categoryId=...` 获取分类下商品

### 5.3 订单页

订单页依赖：

- `/app/orders`

当前已移除运行时 mock 回退逻辑，请求失败时显示空态而不再伪造订单数据。

### 5.4 后台

后台登录后会并发拉取：

- dashboard
- banners
- schools
- categories
- games
- orders
- users
- coupons
- settings
- reports

---

## MySQL 配置

后端当前依赖以下环境变量：

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

示例文件：

- `apps/server/.env.example`

后端启动时会自动：

- 连接 MySQL
- 创建数据库（如果不存在）
- 创建 `app_state` 表
- 首次写入默认种子数据

---

## 6. 当前启动方式

### 6.1 后端

开发运行：

```bash
npm run dev:server
```

或：

```bash
npm run dev --prefix apps/server
```

### 6.2 Web 后台

开发运行：

```bash
npm run dev:admin
```

或：

```bash
npm run dev --prefix apps/admin
```

### 6.3 小程序

建议使用 HBuilderX 打开：

- `apps/mini`

注意：

- 小程序不是直接打开根目录
- 也不要打开旧的无关目录

---

## 7. 当前系统状态判断

### 7.1 已确认正常

- 后端可启动并监听 `3000`
- 静默登录接口可用
- 首页接口 `/app/home` 可用
- Web 后台可打包
- 小程序 `tsc` 检查可通过

### 7.2 当前仍需重点关注

- `pages.json` 与 tabBar 图标编译路径仍需要在 HBuilderX 内最终确认
- 部分页面源码和历史文档存在中文编码问题
- 首页虽然改成了真实数据优先，但内容布局仍带较多“展示型兜底逻辑”
- 数据层仍是文件存储，不是正式数据库实现

---

## 8. 当前主要遗留问题

### 8.1 编码问题

当前仓库中仍有部分文件存在中文乱码或历史编码污染，包括但不限于：

- `README.md`
- 部分小程序页面
- 部分后台页面

建议后续统一：

- 全仓库改成 UTF-8
- 避免再通过错误编码环境编辑 JSON / Vue 文件

### 8.2 小程序 tabBar 图标

当前图标资源已放在：

- `apps/mini/icon-home.png`
- `apps/mini/icon-menu.png`
- `apps/mini/icon-orders.png`
- `apps/mini/icon-profile.png`

但 HBuilderX/微信端对图标路径仍需最终以实际编译结果验证。

### 8.3 当前 MySQL 实现仍是单表状态持久化

当前后端虽然已经切换到 MySQL，但为了尽量少动业务代码，采用的是：

- 单表 `app_state`
- 整体状态 JSON 持久化

优点：

- 改造成本低
- 能快速把原有文件存储切换到 MySQL

不足：

- 不是规范化表设计
- 后期查询统计、并发控制、扩展性都有限

如果后续进入正式商用阶段，建议再拆成规范化业务表。

### 8.4 首页内容尚未彻底平台化

首页目前虽然已经改成“后台优先”，但有些展示区仍是根据真实商品数据拼装出来的前端展示模块，不是后台直接配置的专区模型。

---

## 9. 后续建议开发顺序

建议按以下顺序继续完善：

1. 统一修复全仓库中文编码问题  
2. 彻底确认并修复 tabBar 图标路径  
3. 继续减少首页硬编码展示逻辑，提升后台可配置程度  
4. 将当前单表状态存储拆分为规范化 MySQL 业务表  
5. 给后台和小程序补充更明确的异常空态与加载态  
6. 为订单流、首页流和后台 CRUD 补自动化测试

---

## 10. 一句话结论

当前系统已经具备：

- 三端分离结构
- 本地联调能力
- 后台管理能力
- 小程序核心浏览/下单基础流程

但它仍处于“可开发、可联调、可演示”的阶段，距离“稳定商用”还需要继续完成编码清理、图标路径确认、数据层正式化和首页后台配置能力增强。
