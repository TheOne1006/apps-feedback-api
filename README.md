# NestJS Startkit

这是一个基于 NestJS 框架的轻量级后端启动套件 (Startkit)，旨在帮助开发者快速搭建基于 PostgreSQL 和 Prisma 的后端服务。

## 🎯 重构目标与变更 (Refactoring Goals & Changes)

本项目最近进行了深度重构，目的是剥离具体的业务逻辑，回归纯净的开发脚手架。主要变更如下：

1.  **精简模型与模块**：
    -   ❌ 移除了多余的业务模型和模块：`purchases`, `games`, `feedback`, `chat`, `base-feedback`。
    -   ✅ 仅保留了基础的 `User` 模型，作为用户系统的核心。

2.  **清理配置与依赖**：
    -   ❌ 移除了不通用的业务配置：RSA 加密、Flowise、Dify、Assistant、Apple 登录配置等。
    -   🗑️ 清理了 `config.default.ts` 和 `.env.example` 中的冗余项。

3.  **ORM 迁移与数据库升级**：
    -   🔄 **Sequelize -> Prisma**：完全替换了原有的 Sequelize ORM，拥抱类型安全更佳的 Prisma。
    -   🐘 **Database**：后端数据库统一为 PostgreSQL。
    -   🚀 **Prisma 7.2.0**：使用了最新的 Prisma 7.2.0 版本，并配置了 `@prisma/adapter-pg` 以获得更好的性能和兼容性。

## ✨ 特性 (Features)

-   **核心框架**: NestJS v11
-   **ORM**: Prisma v7.2.0 (配合 PostgreSQL Adapter)
-   **数据库**: PostgreSQL
-   **API 文档**: 集成 Swagger 自动生成文档
-   **鉴权**: 基于 JWT 的用户认证系统
-   **容器化**: 提供 Dockerfile 和 docker-compose.yml 支持

## 🛠️ 快速开始 (Getting Started)

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例配置文件并填入你的数据库信息：

```bash
cp .env.example .env
```

在 `.env` 中修改 `DATABASE_URL`：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### 3. 数据库初始化

使用 Prisma 同步数据库架构：

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 Schema 到数据库
npx prisma db push
```

### 4. 启动项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## 🐳 Docker 运行

```bash
docker-compose up -d
```

## 📝 API 文档

启动项目后，访问 Swagger 文档：

```
http://localhost:3000/api/docs
```
