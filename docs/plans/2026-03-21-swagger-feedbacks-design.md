# Swagger Documentation for FeedbacksController

**Date:** 2026-03-21
**Status:** Approved

## Overview

Add comprehensive Swagger decorators to the `FeedbacksController` so the API is fully self-documenting in Swagger UI. The endpoint accepts `multipart/form-data` with text fields and image uploads.

## Design Decisions

1. **Approach: Standard** — Add `@ApiConsumes('multipart/form-data')` and `@ApiBody` with field descriptions. Not over-engineered with interactive examples.
2. **DTO Swagger decorators: Yes** — Add `@ApiProperty` to all `CreateFeedbackDto` fields for field-level documentation.
3. **Response DTO: Keep minimal** — `BaseFeedbackResponseDto` only documents `id` and `created_at` in the `data` field. The `WrapResponceInterceptor` handles the `code`/`message`/`data` envelope automatically.

## Changes

### `src/feedbacks/feedbacks.controller.ts`

- Add `@ApiConsumes('multipart/form-data')` on the `create` method
- Enhance `@ApiOperation` with a more descriptive summary
- Add `@ApiResponse` for 400 Bad Request

### `src/feedbacks/dtos/create-feedback.dto.ts`

Add `@ApiProperty` decorators to all fields:

- `content`: required, string, 1-100 chars, description: "Feedback content"
- `contact`: optional, string, max 50 chars, description: "Contact information"
- `device_id`: required, string, description: "Device identifier"

## Files to Modify

1. `src/feedbacks/feedbacks.controller.ts`
2. `src/feedbacks/dtos/create-feedback.dto.ts`
