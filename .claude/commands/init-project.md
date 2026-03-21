---
description: 初始化项目环境
---

# 初始化项目 (Initialize Project)

在本地设置并启动 NestJS Startkit 应用程序。

## 1. 安装依赖

```bash
npm install
```

这将安装所有后端依赖项，包括开发依赖项 (NestJS CLI, Jest, ESLint 等)。

## 2. 配置环境

复制示例环境文件：

```bash
cp .env.example .env
```

**注意:** 根据需要编辑 `.env` 文件，特别是数据库连接字符串 (`DATABASE_URL`) 和 JWT 密钥。

## 3. 设置数据库

确保 PostgreSQL 正在运行，然后运行 Prisma 迁移：

```bash
npm run migrate:dev
```

这将应用迁移并生成 Prisma Client。

如果需要种子数据：

```bash
npm run prisma:seed
```

## 4. 启动开发服务器

```bash
npm run dev
```

在端口 3000 上启动 NestJS 服务器 (带热重载)。

## 5. 验证设置

检查一切是否正常工作：

```bash
# 测试 API 健康状况 (假设有健康检查端点)
curl -s http://localhost:3000/api/health

# 检查 Swagger 文档加载
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api
```

## 访问点

- **后端 API**: http://localhost:3000
- **API 文档 (Swagger)**: http://localhost:3000/api

## 清理

要停止服务：
- 在终端中按 `Ctrl+C`

## 备注

- 确保 Docker (如果使用容器化数据库) 或本地 PostgreSQL 实例正在运行。
- 使用 `npm run start:debug` 进行调试模式启动。
