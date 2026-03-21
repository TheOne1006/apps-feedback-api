# NestJS Startkit

A robust NestJS boilerplate with Prisma, PostgreSQL, Authentication, and best practices.

## Tech Stack

- **Framework**: NestJS 11+
- **Language**: TypeScript 5.9+
- **Database**: PostgreSQL
- **ORM**: Prisma 7.2+
- **Authentication**: JWT, Bcrypt
- **Validation**: class-validator, class-transformer
- **Logging**: Winston (nest-winston)
- **Documentation**: Swagger
- **Testing**: Jest, Supertest

## Project Structure

```text
my-nestjs-startkit/
├── config/               # Environment-specific configurations
├── prisma/               # Prisma schema and seed scripts
├── src/
│   ├── common/           # Shared utilities (auth, decorators, interceptors, pipes)
│   ├── core/             # Core modules (logger, filters, global interceptors)
│   ├── users/            # Feature module: Users
│   ├── app.module.ts     # Root module
│   └── main.ts           # Application entry point
├── test/                 # E2E tests
└── .claude/              # Documentation (future use)
```

## Commands

```bash
# Development
npm run dev             # Start in watch mode
npm run start:debug     # Start in debug mode

# Database (Prisma)
npm run prisma:generate # Generate Prisma Client
npm run migrate:dev     # Run migrations (dev)
npm run migrate:deploy  # Deploy migrations (prod)
npm run prisma:studio   # Open Prisma Studio

# Testing
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:cov        # Run coverage

# Quality
npm run lint            # Lint code
npm run format          # Format code
```

## Reference Documentation
Read these documents when working on specific areas:

| Document         | When to Read                                   |
| ---------------- | ---------------------------------------------- |
| `.claude/PRD.md` | Understanding requirements, features, API spec |
| `.claude/reference/deployment-best-practices.md` | Deployment, Docker, PM2, Health Checks |
| `.claude/reference/nestjs-best-practices.md` | Architecture, Modules, Dependency Injection, Guards |
| `.claude/reference/prisma-postgresql-best-practices.md` | Database schema, Migrations, N+1 issues, Transactions |
| `.claude/reference/testing-and-logging.md` | Unit/E2E testing strategies, Winston logging standards |


## Code Conventions

- **Architecture**: Modular architecture (Feature Modules + Core/Common).
- **Naming**: 
  - Files: Kebab-case (e.g., `user.service.ts`)
  - Classes: PascalCase (e.g., `UserService`)
  - Interfaces: PascalCase (e.g., `RequestUser`)
- **Validation**: Use DTOs with `class-validator` decorators for all inputs.
- **Authentication**: Use `AuthGuard` and `RolesGuard` for protecting endpoints.
- **Decorators**: Use custom decorators (e.g., `@User()`, `@Roles()`) from `src/common/decorators`.
- **Response**: All responses are wrapped using `WrapResponceInterceptor`.

## API Design

- **Prefix**: API endpoints typically use `api/` prefix (e.g., `api/users`).
- **Documentation**: Swagger UI available at `/api` (configurable in config).
- **Response Format**: JSON
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": { ... }
  }
  ```
- **Error Handling**: Global exception filters in `src/core/filters` normalize errors.

## Logger

- **Library**: `nest-winston`
- **Configuration**: `src/core/logger/logger.module.ts`
- **Behavior**:
  - Development: Console output with colors.
  - Production: Configurable (File/Console).
- **Usage**: Inject `Logger` service or use standard `Logger`.

## Database

- **Engine**: PostgreSQL
- **ORM**: Prisma
- **Schema**: `prisma/schema.prisma`
- **Tables**:
  - `users`: User accounts and roles.
- **Configuration**: Connection string in `.env` (DATABASE_URL).

## Testing

- **Framework**: Jest
- **Unit Tests**: 
  - Logic verification for Services and Helpers.
  - Mock external dependencies.
- **E2E Tests**: 
  - Verify full API flow.
  - Use `supertest` with a test database environment.

## Test Organization

```text
src/
└── users/
    ├── users.service.ts
    └── __tests__/             # Or colocated *.spec.ts
        └── users.service.spec.ts
test/
├── app.e2e-spec.ts           # E2E tests for App
└── jest-e2e.json             # E2E configuration
```
