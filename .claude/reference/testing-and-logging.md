# 测试与日志最佳实践 (Testing & Logging)

关于如何在 NestJS 项目中实施有效的测试策略和日志记录。

---

## 目录

1. [日志策略 (Logging Strategy)](#1-日志策略-logging-strategy)
2. [测试金字塔 (Testing Pyramid)](#2-测试金字塔-testing-pyramid)
3. [单元测试 (Unit Testing)](#3-单元测试-unit-testing)
4. [端到端测试 (E2E Testing)](#4-端到端测试-e2e-testing)

---

## 1. 日志策略 (Logging Strategy)

本项目使用 `nest-winston` 进行结构化日志记录。

### 为什么使用结构化日志？
传统的文本日志 (`console.log`) 难以解析和查询。结构化日志 (JSON) 包含键值对，可以被日志管理系统（如 ELK, Datadog）轻松索引。

### 配置
- **开发环境**: 使用 `winston.transports.Console` 配合 `nestLike` 格式，提供可读性强的彩色输出。
- **生产环境**: 使用 JSON 格式，并考虑写入文件或流式传输到日志收集器。

### 使用方法

```typescript
import { Logger } from '@nestjs/common';

export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${dto.email}`);
    try {
      // ...
    } catch (error) {
      this.logger.error(`Failed to create user`, error.stack);
      throw error;
    }
  }
}
```

### 上下文绑定
请求 ID (Request ID) 对于追踪跨服务调用至关重要。可以通过中间件生成 `x-request-id` 并附加到日志上下文中。

---

## 2. 测试金字塔 (Testing Pyramid)

我们遵循测试金字塔原则：

- **70% 单元测试 (Unit Tests)**: 测试单个函数、类或服务，Mock 所有依赖。速度快，覆盖率高。
- **20% 集成测试 (Integration Tests)**: 测试模块间的交互（如 Service 与 Database）。
- **10% 端到端测试 (E2E Tests)**: 模拟用户真实请求，覆盖从 Controller 到 Database 的完整链路。

---

## 3. 单元测试 (Unit Testing)

使用 Jest 作为测试框架。NestJS 提供了 `@nestjs/testing` 模块来模拟依赖注入系统。

### 最佳实践
- **文件名**: `*.spec.ts`，通常与源文件放在同一目录。
- **Mocking**: 不要连接真实数据库。使用 `jest.fn()` 或自定义 Mock 对象模拟 Repository/Service。

```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  it('should create a user', async () => {
    prisma.user.create.mockResolvedValue(mockUser);
    const result = await service.create(createUserDto);
    expect(result).toEqual(mockUser);
  });
});
```

---

## 4. 端到端测试 (E2E Testing)

E2E 测试位于 `test/` 目录下。

### 最佳实践
- **测试环境**: 使用独立的测试数据库（如 `test_db`），并在每次测试前/后重置数据。
- **Supertest**: 使用 `supertest` 发起 HTTP 请求。
- **真实依赖**: 尽量连接真实的数据库和第三方服务（如果可行），或者使用 Docker 容器（Testcontainers）。

```typescript
// app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```
