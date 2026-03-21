# Swagger Documentation for FeedbacksController — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive Swagger decorators to `FeedbacksController` and `CreateFeedbackDto` for fully self-documenting API in Swagger UI.

**Architecture:** Add `@nestjs/swagger` decorators at both controller and DTO levels. Controller-level decorators handle HTTP metadata (`@ApiConsumes`, `@ApiOperation`, `@ApiResponse`). DTO-level `@ApiProperty` decorators document request body fields.

**Tech Stack:** NestJS, `@nestjs/swagger`, `class-validator`

---

### Task 1: Add Swagger decorators to `CreateFeedbackDto`

**Files:**
- Modify: `src/feedbacks/dtos/create-feedback.dto.ts`

**Step 1: Add `@ApiProperty` decorators**

Update `src/feedbacks/dtos/create-feedback.dto.ts` to add Swagger property decorators:

```typescript
import { IsString, IsNotEmpty, Length, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Feedback content',
    minLength: 1,
    maxLength: 100,
    example: 'The app crashes when I open settings',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  content: string;

  @ApiPropertyOptional({
    description: 'Contact information (optional)',
    maxLength: 50,
    example: 'user@example.com',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  contact?: string;

  @ApiProperty({
    description: 'Device identifier',
    example: 'device-abc-123',
  })
  @IsString()
  @IsNotEmpty()
  device_id: string;
}
```

**Step 2: Commit**

```bash
git add src/feedbacks/dtos/create-feedback.dto.ts
git commit -m "feat(feedbacks): add @ApiProperty decorators to CreateFeedbackDto"
```

---

### Task 2: Add Swagger decorators to `FeedbacksController`

**Files:**
- Modify: `src/feedbacks/feedbacks.controller.ts`

**Step 1: Update imports and add controller-level decorators**

Update `src/feedbacks/feedbacks.controller.ts`:

```typescript
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FeedbacksService } from './feedbacks.service';
import { FeedbackRateLimitGuard } from './feedbacks.guard';
import { CreateFeedbackDto, BaseFeedbackResponseDto } from './dtos';

@ApiTags('Feedbacks')
@Controller('api/v1/feedback')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @UseGuards(FeedbackRateLimitGuard)
  @ApiOperation({
    summary: 'Submit user feedback',
    description: 'Submit user feedback with optional contact info and up to 3 JPEG images (max 1MB each)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateFeedbackDto })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: BaseFeedbackResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request — Invalid input or file type.' })
  @ApiResponse({ status: 429, description: 'Too Many Requests.' })
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      limits: {
        fileSize: 1024 * 1024 * 10, // 1MB per file
      },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/jpeg$/)) {
          return cb(new BadRequestException('Only JPEG images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateFeedbackDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const result = await this.feedbacksService.createFeedback(dto, files || []);
    return {
      code: 201,
      message: 'Feedback submitted successfully',
      data: result,
    };
  }
}
```

**Step 2: Commit**

```bash
git add src/feedbacks/feedbacks.controller.ts
git commit -m "feat(feedbacks): add Swagger decorators to FeedbacksController"
```

---

### Task 3: Verify — Run tests and check Swagger UI

**Step 1: Run unit tests**

```bash
npm test -- --testPathPattern="feedbacks" --passWithNoTests
```

Expected: All tests pass (or no new tests added for decorator-only changes).

**Step 2: Start the app and verify Swagger docs**

```bash
npm run start:dev
```

Navigate to `http://localhost:3000/api` and verify:
- The endpoint appears under a **"Feedbacks"** tag
- The summary reads "Submit user feedback"
- The description mentions multipart/form-data and JPEG limits
- The request body fields (`content`, `contact`, `device_id`) are documented with types, required flags, and examples
- The 201, 400, and 429 responses are documented

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore(feedbacks): finalize swagger documentation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
