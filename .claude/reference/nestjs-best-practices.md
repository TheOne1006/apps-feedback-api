# NestJS 最佳实践参考指南

一份构建生产级 NestJS 应用程序的简明参考指南。

---

## 目录

1. [项目结构 (Project Structure)](#1-项目结构-project-structure)
2. [控制器与路由 (Controllers & Routing)](#2-控制器与路由-controllers--routing)
3. [DTO 与验证 (DTOs & Validation)](#3-dto-与验证-dtos--validation)
4. [依赖注入与服务 (Dependency Injection)](#4-依赖注入与服务-dependency-injection)
5. [错误处理 (Error Handling)](#5-错误处理-error-handling)
6. [安全性 (Security)](#6-安全性-security)
7. [配置管理 (Configuration)](#7-配置管理-configuration)
8. [反模式 (Anti-Patterns)](#8-反模式-anti-patterns)

---

## 1. 项目结构 (Project Structure)

推荐使用**模块化 (Modular)** 结构，根据业务领域而非文件类型来组织代码。

### 推荐结构

```text
src/
├── common/               # 跨模块共享的资源
│   ├── decorators/       # 自定义装饰器 (@User, @Roles)
│   ├── filters/          # 全局异常过滤器
│   ├── guards/           # 全局守卫 (AuthGuard)
│   ├── interceptors/     # 拦截器 (ResponseWrapper)
│   └── pipes/            # 管道 (ValidationPipe)
├── core/                 # 核心基础设施 (单例)
│   ├── config/           # 配置模块
│   └── logger/           # 日志模块
├── users/                # 业务模块：用户
│   ├── dtos/             # 数据传输对象
│   ├── entities/         # (可选) 领域实体
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.module.ts         # 根模块
└── main.ts               # 入口文件
```

### 关键原则
- **Common Module**: 存放通用的工具、守卫、拦截器。
- **Core Module**: 存放只需导入一次的全局性服务（如 Logger, Config）。
- **Feature Modules**: 每个业务领域（如 Users, Auth）拥有独立的文件夹。

---

## 2. 控制器与路由 (Controllers & Routing)

控制器应保持轻量，仅负责处理 HTTP 请求/响应，业务逻辑应下沉至 Service 层。

### 最佳实践

- **明确的路径前缀**: 使用 `@Controller('api/resource')`。
- **使用标准 HTTP 方法**: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`。
- **状态码**: 使用 `@HttpCode()` 显式指定非 200/201 的状态码。
- **Swagger 文档**: 在控制器和方法上使用 `@ApiTags`, `@ApiOperation`, `@ApiResponse`。

```typescript
@Controller('api/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

---

## 3. DTO 与验证 (DTOs & Validation)

始终使用 DTO (Data Transfer Object) 来定义输入输出数据的形状，并结合 `class-validator` 进行验证。

### 最佳实践

- **每个操作一个 DTO**: `CreateUserDto`, `UpdateUserDto`。
- **使用类而非接口**: 类可以在运行时保留元数据，这对验证管道至关重要。
- **严格验证**: 使用 `ValidationPipe({ whitelist: true })` 自动剥离 DTO 中未定义的属性。

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
}
```

---

## 4. 依赖注入与服务 (Dependency Injection)

利用 NestJS 强大的 DI 系统来管理依赖关系。

### 最佳实践

- **构造函数注入**: 优先使用构造函数注入依赖。
- **单一职责**: 每个 Service 应该只关注一个特定的业务领域。
- **接口分离**: 如果逻辑复杂，考虑为 Service 定义 Interface。

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService, // 注入 Prisma
    private readonly config: ConfigService, // 注入 Config
  ) {}
  // ...
}
```

---

## 5. 错误处理 (Error Handling)

不要在 Controller 中使用大量的 try-catch 块。使用 NestJS 的异常过滤器 (Exception Filters) 统一处理。

### 最佳实践

- **抛出标准异常**: 使用 `NotFoundException`, `BadRequestException` 等内置异常。
- **全局过滤器**: 实现 `AllExceptionsFilter` 来捕获所有未处理异常并格式化响应。
- **业务异常**: 可以创建自定义的业务异常类。

```typescript
// 在 Service 中
const user = await this.prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new NotFoundException(`User with ID ${id} not found`);
}
```

---

## 6. 安全性 (Security)

### 最佳实践

- **Guard (守卫)**: 用于身份验证和授权（如 `JwtAuthGuard`, `RolesGuard`）。
- **Helmet**: 在 `main.ts` 中使用 `helmet` 中间件增强 HTTP 头安全。
- **CORS**: 严格配置 CORS，仅允许受信任的域名。
- **Rate Limiting**: 使用 `@nestjs/throttler` 防止暴力请求。
- **敏感数据**: 永远不要在日志或响应中输出密码、密钥等敏感信息（使用 `class-transformer` 的 `@Exclude`）。

---

## 7. 配置管理 (Configuration)

避免硬编码配置值。

### 最佳实践

- **环境变量**: 使用 `@nestjs/config` 加载 `.env` 文件。
- **类型安全配置**: 定义配置接口或验证 Schema (Joi/Zod) 确保环境变量存在。
- **按环境加载**: 支持 `.env.development`, `.env.production`。

```typescript
// config/index.ts
export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
};
```

---

## 8. 反模式 (Anti-Patterns)

- ❌ **胖控制器 (Fat Controllers)**: 在控制器中编写复杂的业务逻辑。
- ❌ **直接使用 `req` 和 `res`**: 除非必须，否则避免直接操作 Express 的 Request/Response 对象，这会破坏 NestJS 的抽象层。
- ❌ **Any 类型**: 在 DTO 或 Service 中使用 `any` 类型，失去 TypeScript 的优势。
- ❌ **魔术字符串**: 在代码中硬编码字符串（如角色名、状态码），应使用常量或枚举。
