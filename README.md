# Apps Feedback API

一个基于 NestJS 的用户反馈后端服务，支持提交反馈内容、联系方式和图片附件。

## 功能特性

- **反馈提交**: `POST /api/v1/feedback` — 提交用户反馈，支持图片上传
- **图片支持**: JPEG、PNG、GIF、WebP，单文件最大 10MB，最多 3 张
- **频率限制**: 基于设备 ID 的反馈提交频率限制（每分钟最多 3 次）
- **CORS**: 已配置 apps.theone.io、apps.ai-scan.top 及本地开发域名
- **Swagger 文档**: 启用 Bearer JWT 认证，文档地址 `/api`
- **日志**: Winston 结构化日志，支持多环境配置
- **文件存储**: JSON 文件存储，每个设备一个 JSON 文件，图片保存在 `public/uploads/{device_id}/`

## 技术栈

- **框架**: NestJS 11
- **语言**: TypeScript 5.9+
- **存储**: JSON 文件（`public/uploads/`）
- **认证**: JWT Bearer Token（预留）
- **文档**: Swagger
- **日志**: Winston + nest-winston
- **验证**: class-validator + class-transformer

## 项目结构

```
apps-feedback-api/
├── config/                    # 环境配置（default, development, production, unittest）
├── public/
│   └── uploads/               # 上传文件存储目录
├── src/
│   ├── app.controller.ts     # 根路由
│   ├── app.service.ts
│   ├── app.module.ts
│   ├── main.ts               # 应用入口
│   ├── common/               # 公共模块
│   │   ├── constants/        # 常量定义
│   │   ├── decorators/       # 自定义装饰器 (@User, @Roles, @Response, @FileExist)
│   │   ├── interfaces/       # 接口定义
│   │   ├── interceptors/     # 拦截器（SerializerInterceptor）
│   │   └── pipes/            # 管道（ParseInt, ParseArrayInt, ParseJson）
│   ├── core/                  # 核心模块
│   │   ├── filters/          # 全局异常过滤器
│   │   ├── interceptors/     # 全局拦截器（Logging, Cache, WrapResponce）
│   │   └── logger/           # Winston 日志配置
│   └── feedbacks/            # 反馈模块
│       ├── dtos/             # 数据传输对象
│       ├── feedbacks.controller.ts
│       ├── feedbacks.service.ts
│       ├── feedbacks.guard.ts  # 频率限制 Guard
│       └── __tests__/         # 单元测试
└── Dockerfile
└── docker-compose.yml
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

`.env` 示例：

```env
PORT=3000
DOC_SWAGGE=true
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
```

### 3. 启动项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

启动后访问 Swagger 文档：`http://localhost:3000/api`

## API 文档

### 提交反馈

```
POST /api/v1/feedback
Content-Type: multipart/form-data
```

| 字段      | 类型     | 必填 | 说明                    |
|-----------|----------|------|-------------------------|
| content   | string   | 是   | 反馈内容（1-100 字符）   |
| device_id | string   | 是   | 设备标识符               |
| contact   | string   | 否   | 联系方式（最多 50 字符）  |
| images    | File[]   | 否   | 图片（最多 3 张，10MB/张）|

**响应示例：**

```json
{
  "code": 201,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "uuid-here",
    "created_at": "2026-03-21T10:00:00.000Z"
  }
}
```

## Docker 部署

```bash
docker-compose up -d
```

服务将在 `0.0.0.0:3001` 启动（映射到容器内 3000 端口）。

## 测试

```bash
# 单元测试
npm test

# 覆盖率
npm run test:cov

# E2E 测试
npm run test:e2e
```

## 环境配置

| 文件                  | 用途       |
|-----------------------|------------|
| `config.default.ts`   | 默认配置   |
| `config.development.ts` | 开发环境   |
| `config.production.ts`  | 生产环境   |
| `config.unittest.ts`  | 测试环境   |
