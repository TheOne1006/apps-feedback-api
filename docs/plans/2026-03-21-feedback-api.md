# Feedback API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a file-based feedback API for mobile apps that stores feedbacks as JSON files with image uploads.

**Architecture:** Single feedbacks module with controller handling multipart/form-data, service managing file I/O (JSON + images), no database. Uses existing NestJS infrastructure (pipes, filters, logger).

**Tech Stack:** NestJS 11+, TypeScript, class-validator, multer (file upload), uuid

---

## Phase 1: Cleanup - Remove Unused Modules

### Task 1: Delete Users Module

**Files:**
- Delete: `src/users/` (entire directory)

**Step 1: Delete the users directory**

Run: `rm -rf src/users`

**Step 2: Verify deletion**

Run: `ls src/`
Expected: `app.controller.spec.ts  app.controller.ts  app.module.ts  app.service.ts  common  core  main.ts  prisma  setting.controller.ts`

---

### Task 2: Delete Prisma Module

**Files:**
- Delete: `src/prisma/` (entire directory)
- Delete: `prisma/` (entire directory)
- Delete: `prisma.config.ts`

**Step 1: Delete prisma-related files**

Run: `rm -rf src/prisma prisma prisma.config.ts`

**Step 2: Verify deletion**

Run: `ls src/`
Expected: `app.controller.spec.ts  app.controller.ts  app.module.ts  app.service.ts  common  core  main.ts  setting.controller.ts`

---

### Task 3: Delete Auth Module

**Files:**
- Delete: `src/common/auth/` (entire directory)

**Step 1: Delete auth directory**

Run: `rm -rf src/common/auth`

**Step 2: Verify deletion**

Run: `ls src/common/`
Expected: `constants  decorators  interceptors  interfaces  pipes`

---

### Task 4: Delete Setting Controller

**Files:**
- Delete: `src/setting.controller.ts`

**Step 1: Delete setting controller**

Run: `rm src/setting.controller.ts`

**Step 2: Verify deletion**

Run: `ls src/*.ts`
Expected: Only app-related files, no setting.controller.ts

---

### Task 5: Update App Module

**Files:**
- Modify: `src/app.module.ts`

**Step 1: Read current app.module.ts**

Run: Read the file to see current imports

**Step 2: Update app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors related to removed modules

---

### Task 6: Remove Unused Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Remove prisma and bcrypt dependencies**

Run:
```bash
npm uninstall @prisma/client prisma bcrypt
npm uninstall -D @types/bcrypt
```

**Step 2: Verify package.json**

Run: `cat package.json | grep -E "(prisma|bcrypt)"`
Expected: No matches

**Step 7: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove unused modules (users, prisma, auth, setting)"
```

---

## Phase 2: Create Feedbacks Module

### Task 8: Create Module Directory Structure

**Files:**
- Create: `src/feedbacks/` directory
- Create: `src/feedbacks/dtos/` directory
- Create: `src/feedbacks/interfaces/` directory

**Step 1: Create directories**

Run: `mkdir -p src/feedbacks/dtos src/feedbacks/interfaces`

**Step 2: Create uploads directory**

Run: `mkdir -p uploads`

---

### Task 9: Create Feedback Interface

**Files:**
- Create: `src/feedbacks/interfaces/feedback.interface.ts`
- Create: `src/feedbacks/interfaces/index.ts`

**Step 1: Create feedback.interface.ts**

```typescript
export interface FeedbackEntry {
  id: string;
  content: string;
  contact?: string;
  images: string[];
  created_at: string;
}

export interface FeedbackFile {
  device_id: string;
  feedbacks: FeedbackEntry[];
}
```

**Step 2: Create index.ts**

```typescript
export * from './feedback.interface';
```

---

### Task 10: Create CreateFeedbackDto

**Files:**
- Create: `src/feedbacks/dtos/create-feedback.dto.ts`
- Create: `src/feedbacks/dtos/index.ts`

**Step 1: Create create-feedback.dto.ts**

```typescript
import { IsString, IsNotEmpty, Length, MaxLength, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  content: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  contact?: string;

  @IsString()
  @IsNotEmpty()
  device_id: string;
}
```

**Step 2: Create dtos/index.ts**

```typescript
export * from './create-feedback.dto';
```

---

### Task 11: Create Feedbacks Service

**Files:**
- Create: `src/feedbacks/feedbacks.service.ts`

**Step 1: Install uuid package**

Run: `npm install uuid && npm install -D @types/uuid`

**Step 2: Create feedbacks.service.ts**

```typescript
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CreateFeedbackDto } from './dtos';
import { FeedbackEntry, FeedbackFile } from './interfaces';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class FeedbacksService {
  async createFeedback(
    dto: CreateFeedbackDto,
    images: Express.Multer.File[],
  ): Promise<{ id: string; created_at: string }> {
    const { device_id, content, contact } = dto;
    const id = uuidv4();
    const created_at = new Date().toISOString();

    // Prepare image filenames
    const imageFilenames: string[] = [];
    const deviceDir = path.join(UPLOADS_DIR, device_id);

    // Ensure device directory exists
    await fs.mkdir(deviceDir, { recursive: true });

    // Save images
    for (const image of images) {
      const imageId = uuidv4();
      const filename = `${imageId}.jpg`;
      const filepath = path.join(deviceDir, filename);
      await fs.writeFile(filepath, image.buffer);
      imageFilenames.push(filename);
    }

    // Create feedback entry
    const feedbackEntry: FeedbackEntry = {
      id,
      content,
      contact,
      images: imageFilenames,
      created_at,
    };

    // Update JSON file
    const jsonPath = path.join(UPLOADS_DIR, `${device_id}.json`);
    let feedbackFile: FeedbackFile;

    try {
      const existing = await fs.readFile(jsonPath, 'utf-8');
      feedbackFile = JSON.parse(existing);
    } catch {
      feedbackFile = { device_id, feedbacks: [] };
    }

    feedbackFile.feedbacks.push(feedbackEntry);
    await fs.writeFile(jsonPath, JSON.stringify(feedbackFile, null, 2));

    return { id, created_at };
  }
}
```

---

### Task 12: Create Feedbacks Controller

**Files:**
- Create: `src/feedbacks/feedbacks.controller.ts`

**Step 1: Create feedbacks.controller.ts**

```typescript
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dtos';

@Controller('api/v1/feedback')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      limits: {
        fileSize: 1024 * 1024, // 1MB per file
      },
      fileFilter: (req, file, cb) => {
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

---

### Task 13: Create Feedbacks Module

**Files:**
- Create: `src/feedbacks/feedbacks.module.ts`
- Create: `src/feedbacks/index.ts`

**Step 1: Create feedbacks.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { FeedbacksController } from './feedbacks.controller';
import { FeedbacksService } from './feedbacks.service';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
})
export class FeedbacksModule {}
```

**Step 2: Create index.ts**

```typescript
export * from './feedbacks.module';
export * from './feedbacks.controller';
export * from './feedbacks.service';
```

---

### Task 14: Register Feedbacks Module in App

**Files:**
- Modify: `src/app.module.ts`

**Step 1: Update app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CoreModule, FeedbacksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

### Task 15: Update .gitignore

**Files:**
- Modify: `.gitignore`

**Step 1: Add uploads directory to .gitignore**

Add this line to `.gitignore`:
```
# Uploaded files
uploads/
```

---

### Task 16: Verify Build and Test

**Step 1: Check TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Start the application**

Run: `npm run dev`
Expected: Application starts successfully on configured port

**Step 3: Test the endpoint manually**

Run:
```bash
curl -X POST http://localhost:3000/api/v1/feedback \
  -F "content=测试反馈内容" \
  -F "device_id=test-device-001" \
  -F "contact=test@example.com"
```

Expected: JSON response with code 201 and feedback id

**Step 4: Verify file creation**

Run: `cat uploads/test-device-001.json`
Expected: JSON with the feedback data

---

### Task 17: Final Commit

```bash
git add -A
git commit -m "feat: add feedbacks module with file-based storage"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-7 | Remove unused modules and dependencies |
| 2 | 8-17 | Create feedbacks module with full functionality |

Total: 17 tasks
