# Rate Limit Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add IP and device_id rate limiting to the Feedback API with in-memory and file-based storage.

**Architecture:** A NestJS guard that checks both IP (in-memory Map with TTL) and device_id (reads feedback JSON) before allowing requests.

**Tech Stack:** NestJS Guard, Express Request, Node.js fs/promises

---

## Task 1: Inline Interfaces to Service

**Files:**
- Modify: `src/feedbacks/feedbacks.service.ts`
- Delete: `src/feedbacks/interfaces/` (entire directory)

**Step 1: Add inline interfaces to service**

Read `src/feedbacks/feedbacks.service.ts` and add these interfaces at the top of the file:

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

Also update the import to remove the interface import:

```typescript
// Change from:
import { FeedbackEntry, FeedbackFile } from './interfaces';

// Change to: (interfaces are now inline, no import needed)
// Remove the import line entirely
```

**Step 2: Delete interfaces directory**

```bash
rm -rf src/feedbacks/interfaces
```

**Step 3: Verify deletion and compilation**

```bash
ls src/feedbacks/
npx tsc --noEmit
```

Expected: interfaces/ directory should not exist, no TypeScript errors

---

## Task 2: Implement Rate Limit Guard

**Files:**
- Modify: `src/feedbacks/feedbacks.guard.ts`

**Step 1: Read current guard file**

Read `src/feedbacks/feedbacks.guard.ts` to see existing code

**Step 2: Write the complete guard implementation**

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_MAX = 3;

@Injectable()
export class FeedbackRateLimitGuard implements CanActivate {
  // In-memory storage: IP -> [{timestamp}, ...]
  private ipLimitMap = new Map<string, number[]>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { device_id } = request.body;
    const ip = request.ip || request.socket?.remoteAddress;

    // 1. Device ID Check (from JSON file)
    if (device_id) {
      await this.checkDeviceLimit(device_id);
    }

    // 2. IP Check (in-memory)
    if (ip) {
      this.checkIpLimit(ip);
    }

    return true;
  }

  private async checkDeviceLimit(device_id: string): Promise<void> {
    const jsonPath = path.join(UPLOADS_DIR, `${device_id}.json`);
    try {
      const data = await fs.readFile(jsonPath, 'utf-8');
      const feedbackFile = JSON.parse(data);
      const recentCount = this.countRecentFeedbacks(feedbackFile.feedbacks);
      if (recentCount >= RATE_LIMIT_MAX) {
        throw new HttpException(
          'Too many requests. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (e: any) {
      if (e.status === 429) throw e; // Re-throw rate limit errors
      // File doesn't exist -> allow (no feedbacks yet)
    }
  }

  private checkIpLimit(ip: string): void {
    const now = Date.now();
    let entries = this.ipLimitMap.get(ip) || [];

    // Filter out expired entries
    entries = entries.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (entries.length >= RATE_LIMIT_MAX) {
      const oldest = entries[0];
      const remainingMs = RATE_LIMIT_WINDOW_MS - (now - oldest);
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new HttpException(
        `Too many requests. Try again in ${remainingMinutes} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entries.push(now);
    this.ipLimitMap.set(ip, entries);
  }

  private countRecentFeedbacks(feedbacks: any[]): number {
    const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    return feedbacks.filter(f => f.created_at >= cutoff).length;
  }
}
```

**Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors

---

## Task 3: Apply Guard to Controller

**Files:**
- Modify: `src/feedbacks/feedbacks.controller.ts`
- Modify: `src/feedbacks/feedbacks.module.ts`

**Step 1: Update controller to use guard**

Read `src/feedbacks/feedbacks.controller.ts` and add guard import and decorator:

```typescript
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dtos';
import { FeedbackRateLimitGuard } from './feedbacks.guard';

@Controller('api/v1/feedback')
@UseGuards(FeedbackRateLimitGuard)
export class FeedbacksController {
  // ... rest of the controller
}
```

**Step 2: Update module to provide guard**

Read `src/feedbacks/feedbacks.module.ts` and update:

```typescript
import { Module } from '@nestjs/common';
import { FeedbacksController } from './feedbacks.controller';
import { FeedbacksService } from './feedbacks.service';
import { FeedbackRateLimitGuard } from './feedbacks.guard';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksService, FeedbackRateLimitGuard],
})
export class FeedbacksModule {}
```

**Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors

---

## Task 4: Test Rate Limiting

**Step 1: Start the application**

```bash
npm run dev
```

Wait for the application to start (about 5 seconds)

**Step 2: Test device_id rate limiting**

Send 3 requests with the same device_id:
```bash
for i in 1 2 3 4; do
  echo "Request $i:"
  curl -s -X POST http://localhost:3000/api/v1/feedback \
    -F "content=Test feedback $i" \
    -F "device_id=rate-test-device" | jq .
  echo ""
done
```

Expected:
- Requests 1-3: 201 Created
- Request 4: 429 Too Many Requests

**Step 3: Clean up test data**

```bash
rm -rf uploads/rate-test-device*
```

**Step 4: Stop the application**

```bash
pkill -f "nest start" 2>/dev/null || true
```

---

## Task 5: Commit

```bash
git add -A
git commit -m "feat: add rate limit guard for feedback API

- Add FeedbackRateLimitGuard with IP (memory) and device_id (JSON) limits
- Limit: 3 requests per 30 minutes per IP and device_id
- Inline interfaces into service, remove interfaces/ directory
- Apply guard to feedback controller

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Inline interfaces to service, delete interfaces/ directory |
| 2 | Implement rate limit guard logic |
| 3 | Apply guard to controller and module |
| 4 | Test rate limiting end-to-end |
| 5 | Commit changes |

Total: 5 tasks
