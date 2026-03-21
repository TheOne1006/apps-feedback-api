# Feedback API Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add complete unit tests and integration tests for the Feedback API.

**Architecture:** Use Jest + @nestjs/testing + supertest. Mock fs operations for unit tests, use real file system with temp directories for integration tests.

**Tech Stack:** Jest, @nestjs/testing, supertest

---

## Task 1: Create Service Unit Tests

**Files:**
- Create: `src/feedbacks/__tests__/feedbacks.service.spec.ts`

**Step 1: Create test directory and file**

```bash
mkdir -p src/feedbacks/__tests__
```

**Step 2: Write the test file**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FeedbacksService, FeedbackEntry, FeedbackFile } from '../feedbacks.service';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs module
jest.mock('fs/promises');

describe('FeedbacksService', () => {
  let service: FeedbacksService;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbacksService],
    }).compile();

    service = module.get<FeedbacksService>(FeedbacksService);
    // Reset ipLimitMap
    (service as any).ipLimitMap = new Map();
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('should create feedback successfully', async () => {
      const dto = { content: 'Test feedback', device_id: 'device-123' };
      const mockJsonData: FeedbackFile = { device_id: 'device-123', feedbacks: [] };

      mockFs.mkdir.mockResolvedValue(undefined as any);
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' } as any);
      mockFs.writeFile.mockResolvedValue(undefined as any);

      const result = await service.createFeedback(dto, []);

      expect(result.id).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        path.join(UPLOADS_DIR, 'device-123'),
        { recursive: true }
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(UPLOADS_DIR, 'device-123.json'),
        expect.any(String)
      );
    });

    it('should save images in device directory', async () => {
      const dto = { content: 'Test feedback', device_id: 'device-123' };
      const mockFile = { buffer: Buffer.from('fake-image'), mimetype: 'image/jpeg' } as Express.Multer.File;

      mockFs.mkdir.mockResolvedValue(undefined as any);
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' } as any);
      mockFs.writeFile.mockResolvedValue(undefined as any);

      await service.createFeedback(dto, [mockFile]);

      // Verify writeFile called for image
      const imageWriteCall = mockFs.writeFile.mock.calls.find(
        call => call[0].includes('device-123') && call[0].endsWith('.jpg')
      );
      expect(imageWriteCall).toBeDefined();
      expect(imageWriteCall![1]).toEqual(Buffer.from('fake-image'));
    });

    it('should append to existing JSON file', async () => {
      const dto = { content: 'New feedback', device_id: 'device-123' };
      const existingData: FeedbackFile = {
        device_id: 'device-123',
        feedbacks: [{ id: 'old-id', content: 'Old', images: [], created_at: '2020-01-01' }]
      };

      mockFs.mkdir.mockResolvedValue(undefined as any);
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingData));
      mockFs.writeFile.mockResolvedValue(undefined as any);

      await service.createFeedback(dto, []);

      const writeCall = mockFs.writeFile.mock.calls[1];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData.feedbacks).toHaveLength(2);
      expect(writtenData.feedbacks[0].id).toBe('old-id');
      expect(writtenData.feedbacks[1].content).toBe('New feedback');
    });
  });

  describe('checkDeviceLimit', () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined as any);
      mockFs.writeFile.mockResolvedValue(undefined as any);
    });

    it('should allow when under limit', async () => {
      const recentFeedbacks: FeedbackEntry[] = [
        { id: '1', content: 'a', images: [], created_at: new Date().toISOString() },
        { id: '2', content: 'b', images: [], created_at: new Date().toISOString() },
      ];
      const data: FeedbackFile = { device_id: 'device', feedbacks: recentFeedbacks };

      mockFs.readFile.mockResolvedValue(JSON.stringify(data));

      // Should not throw
      await expect(
        service.checkDeviceLimit('device')
      ).resolves.toBeUndefined();
    });

    it('should throw 429 when limit exceeded', async () => {
      const recentFeedbacks: FeedbackEntry[] = [
        { id: '1', content: 'a', images: [], created_at: new Date().toISOString() },
        { id: '2', content: 'b', images: [], created_at: new Date().toISOString() },
        { id: '3', content: 'c', images: [], created_at: new Date().toISOString() },
      ];
      const data: FeedbackFile = { device_id: 'device', feedbacks: recentFeedbacks };

      mockFs.readFile.mockResolvedValue(JSON.stringify(data));

      await expect(service.checkDeviceLimit('device')).rejects.toThrow(HttpException);
    });

    it('should allow when no existing file', async () => {
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' } as any);

      await expect(
        service.checkDeviceLimit('new-device')
      ).resolves.toBeUndefined();
    });
  });

  describe('checkIpLimit', () => {
    it('should allow when under limit', () => {
      // Should not throw for first 3 requests
      expect(() => (service as any).checkIpLimit('192.168.1.1')).not.toThrow();
      expect(() => (service as any).checkIpLimit('192.168.1.1')).not.toThrow();
      expect(() => (service as any).checkIpLimit('192.168.1.1')).not.toThrow();
    });

    it('should throw 429 when limit exceeded', () => {
      (service as any).checkIpLimit('192.168.1.2');
      (service as any).checkIpLimit('192.168.1.2');
      (service as any).checkIpLimit('192.168.1.2');

      expect(() => (service as any).checkIpLimit('192.168.1.2')).toThrow(HttpException);
    });

    it('should delete key when all entries expire', () => {
      const map = (service as any).ipLimitMap;

      // Add entries
      (service as any).checkIpLimit('192.168.1.3');
      expect(map.has('192.168.1.3')).toBe(true);

      // Manually expire entries (in real scenario, entries auto-expire after 30 min)
      map.set('192.168.1.3', []);
      (service as any).checkIpLimit('192.168.1.3'); // Should delete key

      expect(map.has('192.168.1.3')).toBe(false);
    });

    it('should allow different IPs independently', () => {
      (service as any).checkIpLimit('10.0.0.1');
      (service as any).checkIpLimit('10.0.0.1');
      (service as any).checkIpLimit('10.0.0.1');

      // Different IP should be allowed
      expect(() => (service as any).checkIpLimit('10.0.0.2')).not.toThrow();
    });
  });
});
```

**Step 3: Run tests**

```bash
npx jest src/feedbacks/__tests__/feedbacks.service.spec.ts --no-coverage
```

Expected: All tests should pass

**Step 4: Commit**

```bash
git add src/feedbacks/__tests__/feedbacks.service.spec.ts
git commit -m "test: add unit tests for FeedbacksService"
```

---

## Task 2: Create Controller Unit Tests

**Files:**
- Create: `src/feedbacks/__tests__/feedbacks.controller.spec.ts`

**Step 1: Write the test file**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FeedbacksController } from '../feedbacks.controller';
import { FeedbacksService } from '../feedbacks.service';
import { HttpException } from '@nestjs/common';

describe('FeedbacksController', () => {
  let controller: FeedbacksController;
  let mockService: Partial<FeedbacksService>;

  beforeEach(async () => {
    mockService = {
      createFeedback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbacksController],
      providers: [
        { provide: FeedbacksService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<FeedbacksController>(FeedbacksController);
  });

  describe('create', () => {
    it('should return 201 with feedback data', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      const mockResult = { id: 'test-id', created_at: '2026-03-21T00:00:00.000Z' };
      mockService.createFeedback = jest.fn().mockResolvedValue(mockResult);

      const result = await controller.create(dto, [], '127.0.0.1');

      expect(result).toEqual({
        code: 201,
        message: 'Feedback submitted successfully',
        data: mockResult,
      });
    });

    it('should call service with correct params', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      mockService.createFeedback = jest.fn().mockResolvedValue({ id: '1', created_at: 'now' });

      await controller.create(dto, [], '192.168.1.1');

      expect(mockService.createFeedback).toHaveBeenCalledWith(
        dto,
        [],
        '192.168.1.1'
      );
    });

    it('should pass images to service', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      const mockImages = [{ buffer: Buffer.from('img') }] as Express.Multer.File[];
      mockService.createFeedback = jest.fn().mockResolvedValue({ id: '1', created_at: 'now' });

      await controller.create(dto, mockImages, '127.0.0.1');

      expect(mockService.createFeedback).toHaveBeenCalledWith(
        dto,
        mockImages,
        '127.0.0.1'
      );
    });

    it('should handle service errors', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      mockService.createFeedback = jest.fn().mockRejectedValue(
        new HttpException('Rate limit exceeded', 429)
      );

      await expect(controller.create(dto, [], '127.0.0.1')).rejects.toThrow(HttpException);
    });
  });
});
```

**Step 2: Run tests**

```bash
npx jest src/feedbacks/__tests__/feedbacks.controller.spec.ts --no-coverage
```

Expected: All tests should pass

**Step 3: Commit**

```bash
git add src/feedbacks/__tests__/feedbacks.controller.spec.ts
git commit -m "test: add unit tests for FeedbacksController"
```

---

## Task 3: Create Integration Tests

**Files:**
- Create: `test/feedbacks.e2e-spec.ts`

**Step 1: Write the test file**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppModule } from '../src/app.module';

describe('Feedbacks (e2e)', () => {
  let app: INestApplication;
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
  const testDeviceId = 'e2e-test-device';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test files
    try {
      await fs.rm(path.join(UPLOADS_DIR, testDeviceId), { recursive: true, force: true });
      await fs.rm(path.join(UPLOADS_DIR, `${testDeviceId}.json`), { force: true });
    } catch {}
    await app.close();
  });

  beforeEach(async () => {
    // Reset rate limit between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('POST /api/v1/feedback', () => {
    it('should create feedback successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .field('content', 'This is a test feedback')
        .field('device_id', testDeviceId)
        .field('contact', 'test@example.com')
        .expect(201);

      expect(response.body.data.code).toBe(201);
      expect(response.body.data.data.id).toBeDefined();
      expect(response.body.data.data.created_at).toBeDefined();
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .field('device_id', testDeviceId)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for invalid content length', async () => {
      const longContent = 'a'.repeat(101);

      const response = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .field('content', longContent)
        .field('device_id', testDeviceId)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for missing device_id', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .field('content', 'Valid content')
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 429 when device_id limit exceeded', async () => {
      // Make 3 requests (within limit)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/feedback')
          .field('content', `Feedback ${i}`)
          .field('device_id', `${testDeviceId}-ratelimit`)
          .expect(201);
      }

      // 4th request should be blocked
      const response = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .field('content', 'Feedback 4')
        .field('device_id', `${testDeviceId}-ratelimit`)
        .expect(429);

      expect(response.body.statusCode).toBe(429);
      expect(response.body.message).toContain('Too many requests');
    });

    it('should accept valid content length (boundary)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feedback')
        .field('content', 'a'.repeat(100))
        .field('device_id', `${testDeviceId}-boundary`)
        .expect(201);

      expect(response.body.data.code).toBe(201);
    });
  });
});
```

**Step 2: Run tests**

```bash
npx jest --config ./test/jest-e2e.json test/feedbacks.e2e-spec.ts --no-coverage
```

Expected: All tests should pass

**Step 3: Commit**

```bash
git add test/feedbacks.e2e-spec.ts
git commit -m "test: add e2e tests for feedback API"
```

---

## Task 4: Run All Tests

**Step 1: Run all tests**

```bash
npm test -- --passWithNoTests
```

Expected: All tests should pass

**Step 2: Run with coverage**

```bash
npm run test:cov
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Unit tests for FeedbacksService |
| 2 | Unit tests for FeedbacksController |
| 3 | E2E tests for API endpoint |
| 4 | Run all tests |

Total: 4 tasks
