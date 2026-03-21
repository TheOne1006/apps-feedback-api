# NestJS Startkit - 产品需求文档 (PRD)

## 1. 执行摘要 (Executive Summary)

**NestJS Startkit** 是一个基于 NestJS 框架的现代化、轻量级后端启动套件。旨在为开发者提供一个遵循最佳实践、开箱即用的后端基础设施，集成了 PostgreSQL 数据库、Prisma ORM、JWT 认证以及完善的日志和测试配置。

本项目的核心价值在于**减少重复造轮子**。它剥离了具体的业务逻辑，仅保留最核心的系统模块，让开发者能够在一个干净、稳健的基础上快速构建自己的业务应用。

---

## 2. 愿景与原则 (Mission & Principles)

**愿景**: 成为 NestJS 开发者启动新项目的首选脚手架，提供极致的开发体验和生产级的基础架构。

### 核心原则

1.  **极简主义 (Simplicity)**: 仅保留通用的核心功能，不包含特定的业务逻辑。
2.  **最佳实践 (Best Practices)**: 遵循 NestJS 官方推荐的模块化架构、依赖注入和代码风格。
3.  **类型安全 (Type Safety)**: 从数据库 (Prisma) 到 API (DTO) 的全链路 TypeScript 类型支持。
4.  **易于扩展 (Extensibility)**: 清晰的模块边界，方便开发者添加新的功能模块。
5.  **生产就绪 (Production Ready)**: 内置日志、配置管理、Docker 支持和统一的错误处理。

---

## 3. 目标用户 (Target Users)

*   **独立开发者**: 需要快速搭建 MVP (最小可行性产品) 的全栈或后端开发者。
*   **初创团队**: 需要一个稳健、可扩展的后端基础架构，以减少初期技术选型和搭建成本。
*   **NestJS 学习者**: 希望学习 NestJS 架构设计、Prisma 集成和测试策略的开发者。

---

## 4. 产品范围 (Product Scope)

### ✅ 包含 (In Scope)

*   **核心框架**: NestJS 11+ 配置与启动脚本。
*   **数据持久化**: PostgreSQL 数据库集成，Prisma ORM 配置（Schema 管理、迁移、Seed）。
*   **身份认证**: 基于 JWT (JSON Web Token) 的用户注册、登录、Token 签发与验证。
*   **用户管理**: 基础的用户模型 (User)、个人信息查询、密码加密存储。
*   **系统基础**:
    *   统一响应格式 (Response Wrapper)。
    *   全局异常处理 (Global Exception Filter)。
    *   结构化日志系统 (Winston)。
    *   环境变量配置管理 (Config)。
*   **开发体验**:
    *   Swagger API 文档自动生成。
    *   ESLint + Prettier 代码规范。
    *   Docker & Docker Compose 容器化支持。
*   **测试**: 单元测试 (Unit Test) 和端到端测试 (E2E Test) 基础设置。

### ❌ 不包含 (Out of Scope)

*   **复杂业务模块**: 支付、商城、聊天、即时通讯等具体业务功能。
*   **前端应用**: 本项目仅为后端 API 服务（Headless）。
*   **高级权限管理**: 仅提供基础 Role 字段，不包含复杂的 RBAC (基于角色的访问控制) 管理界面（但代码层面支持扩展）。
*   **多租户**: 默认为单租户架构。

---

## 5. 功能需求 (Functional Requirements)

### 5.1 用户认证模块 (Auth Module)

*   **用户注册**: 支持邮箱/密码注册，需校验邮箱唯一性。
*   **用户登录**: 支持邮箱/密码登录，登录成功返回 JWT Access Token。
*   **密码安全**: 密码必须加盐哈希存储 (Bcrypt)。
*   **路由保护**: 提供 `JwtAuthGuard` 保护需要认证的 API 接口。

### 5.2 用户管理模块 (User Module)

*   **个人信息**: 登录用户可以获取自己的个人资料 (Profile)。
*   **基础模型**:
    *   `id`: UUID
    *   `username`: 用户名
    *   `email`: 邮箱 (唯一)
    *   `password`: 加密后的密码
    *   `roles`: 角色列表 (JSON)
    *   `created_at` / `updated_at`: 时间戳

### 5.3 系统基础模块 (Core Module)

*   **配置管理**: 支持 `.env` 文件加载，根据环境 (Dev/Prod/Test) 加载不同配置。
*   **日志记录**:
    *   开发环境: 控制台彩色输出。
    *   生产环境: 结构化 JSON 日志，支持文件输出。
    *   记录请求 ID、HTTP 方法、URL、响应时间等信息。
*   **API 文档**: 自动生成 OpenAPI (Swagger) 文档，访问路径 `/api` (可配置)。

---

## 6. 非功能需求 (Non-Functional Requirements)

*   **性能**: API 响应时间在正常负载下应 < 200ms。
*   **安全性**:
    *   防止 SQL 注入 (由 Prisma 保证)。
    *   强制类型校验 (Class Validator)。
    *   敏感信息 (如密码) 不可明文传输或存储。
*   **可维护性**: 代码需通过 ESLint 检查，遵循统一的编码规范。
*   **兼容性**: 支持 Node.js 18+ 环境，PostgreSQL 14+。

---

## 7. 架构设计 (Architecture Design)

### 7.1 目录结构

遵循 NestJS 模块化设计：

```text
src/
├── common/           # 通用模块 (Auth, Decorators, Interceptors, Pipes)
├── core/             # 核心模块 (Logger, Filters, Global Setup)
├── users/            # 业务模块: 用户
├── app.module.ts     # 根模块
└── main.ts           # 入口文件
```

### 7.2 技术栈

| 组件 | 技术选型 | 版本 | 说明 |
| :--- | :--- | :--- | :--- |
| **Framework** | NestJS | 11+ | 核心框架 |
| **Language** | TypeScript | 5.9+ | 开发语言 |
| **Database** | PostgreSQL | Latest | 关系型数据库 |
| **ORM** | Prisma | 7.2+ | 数据库操作与迁移 |
| **Auth** | JWT + Passport | - | 无状态认证 |
| **Logging** | Winston | - | 结构化日志 |
| **Validation** | class-validator | - | DTO 验证 |
| **Testing** | Jest | - | 单元与 E2E 测试 |

### 7.3 API 规范

*   **URL 前缀**: `/api/`
*   **响应格式**:
    ```json
    {
      "code": 200,
      "message": "Success",
      "data": { ... }
    }
    ```
*   **错误处理**: 所有异常被 `AllExceptionsFilter` 捕获，返回统一的错误 JSON。

---

## 8. 数据库设计 (Database Schema)

基于 Prisma Schema (`prisma/schema.prisma`)：

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @db.VarChar(50)
  email     String   @unique @db.VarChar(50)
  password  String   @db.VarChar(100)
  salt      String   @db.VarChar(30)
  roles     Json     @default("[]") @db.JsonB
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
  @@index([username])
}
```

---

## 9. 路线图 (Roadmap)

### Phase 1: 基础架构 (已完成)
*   [x] NestJS 环境搭建
*   [x] PostgreSQL + Prisma 集成
*   [x] JWT 认证流程
*   [x] 统一响应与异常处理
*   [x] Winston 日志集成

### Phase 2: 增强与优化 (进行中)
*   [ ] 完善单元测试覆盖率
*   [ ] 增加更多 E2E 测试场景
*   [ ] 优化 Docker 镜像构建体积

