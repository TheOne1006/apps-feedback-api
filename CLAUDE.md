# Apps Feedback API

A NestJS-based user feedback backend service with image upload, rate limiting, and Swagger documentation.

## Tech Stack

- **Framework**: NestJS 11+
- **Language**: TypeScript 5.9+
- **Storage**: JSON file storage (`public/uploads/`)
- **Validation**: class-validator, class-transformer
- **Logging**: Winston (nest-winston)
- **Documentation**: Swagger
- **Testing**: Jest, Supertest

## Project Structure

```text
apps-feedback-api/
├── config/               # Environment-specific configurations
├── public/
│   └── uploads/          # Feedback data (JSON) and uploaded images
├── src/
│   ├── common/           # Shared utilities (decorators, interceptors, pipes, interfaces)
│   ├── core/             # Core modules (logger, filters, global interceptors)
│   ├── feedbacks/        # Feature module: Feedback submission + rate limiting
│   ├── app.module.ts     # Root module
│   └── main.ts           # Application entry point
└── test/                 # E2E tests

## Commands

```bash
# Development
npm run start:dev        # Start in watch mode
npm run start:debug      # Start in debug mode

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:cov         # Run coverage

# Quality
npm run lint             # Lint code
npm run format           # Format code
```

## Code Conventions

- **Architecture**: Modular architecture (Feature Modules + Core/Common).
- **Naming**:
  - Files: Kebab-case (e.g., `user.service.ts`)
  - Classes: PascalCase (e.g., `UserService`)
  - Interfaces: PascalCase (e.g., `RequestUser`)
- **Validation**: Use DTOs with `class-validator` decorators for all inputs.
- **Decorators**: Use custom decorators (e.g., `@User()`, `@Response()`, `@FileExist()`) from `src/common/decorators`.
- **Response**: All responses are wrapped using `WrapResponceInterceptor`.

## API Design

- **Prefix**: API endpoints use `api/` prefix (e.g., `api/v1/feedback`).
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

## Storage

- **Feedback Data**: JSON files stored at `public/uploads/{device_id}.json`
- **Images**: Stored at `public/uploads/{device_id}/` with UUID filenames
- **Rate Limiting**: In-memory (IP-based + device ID-based, 3 requests per 30 minutes)

## Testing

- **Framework**: Jest
- **Unit Tests**:
  - Logic verification for Services, Guards, Controllers.
  - Mock external dependencies (fs, path).
- **E2E Tests**:
  - Verify full API flow.
  - Use `supertest`.

## Test Organization

```text
src/
├── feedbacks/
│   ├── __tests__/
│   │   ├── feedbacks.controller.spec.ts
│   │   ├── feedbacks.service.spec.ts
│   │   └── feedbacks.guard.spec.ts
│   ├── feedbacks.controller.ts
│   └── feedbacks.service.ts
test/
├── app.e2e-spec.ts           # E2E tests for App
├── feedbacks.e2e-spec.ts     # E2E tests for Feedbacks
└── jest-e2e.json             # E2E configuration
```
