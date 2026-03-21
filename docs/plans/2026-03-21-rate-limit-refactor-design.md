# Refactor: Move Rate Limiting from Service to Guard

## Date: 2026-03-21

## Problem

Both `FeedbackRateLimitGuard` and `FeedbacksService` have duplicated `checkDeviceLimit` and `checkIpLimit` logic. NestJS best practice: **guards handle cross-cutting concerns (rate limiting), services handle business logic**.

## Changes

### 1. `feedbacks.service.ts` — Remove all rate limiting
- Remove `ipLimitMap`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- Remove `checkDeviceLimit`, `checkIpLimit`, `countRecentFeedbacks`
- Remove `clientIp` parameter from `createFeedback`
- Keep only pure business logic (save feedback + images)

### 2. `feedbacks.controller.ts` — Remove `@Ip()` decorator
- Remove `@Ip() ip` decorator and `ip` parameter from `create()`
- Stop passing `ip` to `feedbacksService.createFeedback()`

### 3. `feedbacks.service.spec.ts` — Remove rate limit tests
- Remove `describe('checkDeviceLimit')` and `describe('checkIpLimit')` test blocks
- Update `createFeedback` calls to remove the 3rd `clientIp` argument

### 4. `feedbacks.controller.spec.ts` — Remove IP from mock calls
- Update `controller.create()` calls to remove the 3rd IP argument

### 5. Add guard unit tests (new `__tests__/feedbacks.guard.spec.ts`)
- Test `checkDeviceLimit`: under limit, at limit (429), no file (allow)
- Test `checkIpLimit`: under limit, at limit (429), expired entries cleaned
- Test `canActivate`: device + IP checks flow

### 6. Run Jest coverage test

## Architecture After
```
Request → Guard (rate limit check) → Controller → Service (business logic)
           ↑ ipLimitMap + JSON file
```
