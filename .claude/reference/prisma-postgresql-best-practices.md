# Prisma & PostgreSQL 最佳实践参考

一份在 NestJS 项目中高效使用 Prisma ORM 和 PostgreSQL 数据库的指南。

---

## 目录

- [Prisma \& PostgreSQL 最佳实践参考](#prisma--postgresql-最佳实践参考)
  - [目录](#目录)
  - [1. Schema 设计 (Schema Design)](#1-schema-设计-schema-design)
    - [命名规范](#命名规范)
    - [关系定义](#关系定义)
  - [2. 迁移工作流 (Migrations Workflow)](#2-迁移工作流-migrations-workflow)
    - [开发环境](#开发环境)
    - [生产环境](#生产环境)
    - [团队协作](#团队协作)
  - [3. 查询最佳实践 (Querying Best Practices)](#3-查询最佳实践-querying-best-practices)
    - [选择所需字段 (Select)](#选择所需字段-select)
    - [关联查询 (Relation Queries)](#关联查询-relation-queries)
    - [事务 (Transactions)](#事务-transactions)
  - [4. 性能优化 (Performance Optimization)](#4-性能优化-performance-optimization)
    - [索引 (Indexing)](#索引-indexing)
    - [N+1 问题](#n1-问题)
    - [连接池 (Connection Pooling)](#连接池-connection-pooling)
  - [5. 数据填充 (Seeding)](#5-数据填充-seeding)
    - [最佳实践](#最佳实践)

---

## 1. Schema 设计 (Schema Design)

Schema 文件 (`schema.prisma`) 是数据库的单一真实来源。

### 命名规范
- **模型 (Models)**: 使用 **PascalCase** (单数)，如 `User`, `UserProfile`。
- **字段 (Fields)**: 使用 **camelCase**，如 `firstName`, `createdAt`。
- **数据库映射**: 使用 `@@map` 和 `@map` 映射到数据库中的 **snake_case** 表名和列名（符合 PostgreSQL 惯例）。

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  firstName String   @map("first_name") // DB 列名: first_name
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users") // DB 表名: users
}
```

### 关系定义
- 始终明确定义关系的双方，即使你只用到其中一方（有助于理解数据结构）。
- 为外键字段设置适当的索引。

---

## 2. 迁移工作流 (Migrations Workflow)

Prisma Migrate 是管理数据库架构变更的工具。

### 开发环境
1. 修改 `schema.prisma`。
2. 运行 `npx prisma migrate dev --name <descriptive-name>`。
   - 这会生成 SQL 迁移文件并应用到开发数据库。
   - 也会重新生成 Prisma Client (`node_modules`).

### 生产环境
1. 运行 `npx prisma migrate deploy`。
   - 这只会应用尚未应用的迁移，不会重置数据库或生成新文件。
2. **切勿** 在生产环境运行 `migrate dev`。

### 团队协作
- 将 `prisma/migrations` 目录提交到 Git。
- 拉取代码后，如果发现有新迁移，运行 `npx prisma migrate dev`（不带 name 参数）来应用。

---

## 3. 查询最佳实践 (Querying Best Practices)

### 选择所需字段 (Select)
避免获取不必要的数据，特别是大字段（如 JSON, Text）。使用 `select` 仅获取所需字段。

```typescript
// ✅ Good
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true }
});

// ❌ Bad (获取所有字段，包括潜在的敏感信息或大字段)
const user = await prisma.user.findUnique({ where: { id } });
```

### 关联查询 (Relation Queries)
- 使用 `include` 获取关联数据，但要注意嵌套层级不要过深。
- 对于复杂的聚合查询，考虑使用 `prisma.$queryRaw` 编写原生 SQL，但要注意类型安全。

### 事务 (Transactions)
对于必须原子执行的多个操作，使用 `$transaction`。

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ ... });
  await tx.profile.create({ userId: user.id, ... });
});
```

---

## 4. 性能优化 (Performance Optimization)

### 索引 (Indexing)
- 为经常用于 `where`、`orderBy` 或 `join` (外键) 的字段添加索引。
- 在 Prisma 中使用 `@@index` 定义。

```prisma
model Post {
  // ...
  authorId String
  @@index([authorId]) // 加速按作者查询
}
```

### N+1 问题
Prisma 的 `findMany` 配合 `include` 可以在一定程度上避免 N+1 问题（Prisma 会将其优化为少量查询）。
但在循环中执行查询是常见的性能杀手。

```typescript
// ❌ Bad: 循环查询
for (const userId of userIds) {
  await prisma.user.findUnique({ where: { id: userId } });
}

// ✅ Good: 批量查询
const users = await prisma.user.findMany({
  where: { id: { in: userIds } }
});
```

### 连接池 (Connection Pooling)
- 在 Serverless 或高并发环境下，确保正确配置连接池大小。
- 使用 `PgBouncer` 等工具进行连接池管理。

---

## 5. 数据填充 (Seeding)

使用 `prisma/seed.ts` 初始化基础数据（如默认角色、管理员账号）。

### 最佳实践
- 保持幂等性 (Idempotent)：Seeding 脚本应该可以重复运行而不报错（使用 `upsert` 而非 `create`）。
- 分离测试数据与生产基础数据。

```typescript
// prisma/seed.ts
async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  });
}
```
