// Mock fs module (must be before imports)
jest.mock('fs/promises');

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { FeedbackRateLimitGuard } from '../feedbacks.guard';
import * as fs from 'fs/promises';

describe('FeedbackRateLimitGuard', () => {
  let guard: FeedbackRateLimitGuard;
  const mockFs = fs as jest.Mocked<typeof fs>;

  const createMockContext = (device_id?: string, ip?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          body: device_id ? { device_id } : {},
          ip: ip || '127.0.0.1',
          socket: { remoteAddress: ip || '127.0.0.1' },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackRateLimitGuard],
    }).compile();

    guard = module.get<FeedbackRateLimitGuard>(FeedbackRateLimitGuard);
    // Reset ipLimitMap
    (guard as any).ipLimitMap = new Map();
    jest.clearAllMocks();
  });

  describe('checkDeviceLimit', () => {
    it('should allow when under limit', async () => {
      const recentFeedbacks = [
        { id: '1', content: 'a', images: [], created_at: new Date().toISOString() },
        { id: '2', content: 'b', images: [], created_at: new Date().toISOString() },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify({ device_id: 'device', feedbacks: recentFeedbacks }));

      await expect((guard as any).checkDeviceLimit('device')).resolves.toBeUndefined();
    });

    it('should throw 429 when limit exceeded', async () => {
      const recentFeedbacks = [
        { id: '1', content: 'a', images: [], created_at: new Date().toISOString() },
        { id: '2', content: 'b', images: [], created_at: new Date().toISOString() },
        { id: '3', content: 'c', images: [], created_at: new Date().toISOString() },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify({ device_id: 'device', feedbacks: recentFeedbacks }));

      await expect((guard as any).checkDeviceLimit('device')).rejects.toThrow(HttpException);
      await expect((guard as any).checkDeviceLimit('device')).rejects.toMatchObject({
        status: HttpStatus.TOO_MANY_REQUESTS,
      });
    });

    it('should allow when no existing file (ENOENT)', async () => {
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' } as any);

      await expect((guard as any).checkDeviceLimit('new-device')).resolves.toBeUndefined();
    });
  });

  describe('checkIpLimit', () => {
    it('should allow when under limit', () => {
      expect(() => (guard as any).checkIpLimit('192.168.1.1')).not.toThrow();
      expect(() => (guard as any).checkIpLimit('192.168.1.1')).not.toThrow();
      expect(() => (guard as any).checkIpLimit('192.168.1.1')).not.toThrow();
    });

    it('should throw 429 when limit exceeded', async () => {
      (guard as any).checkIpLimit('192.168.1.2');
      (guard as any).checkIpLimit('192.168.1.2');
      (guard as any).checkIpLimit('192.168.1.2');

      try {
        (guard as any).checkIpLimit('192.168.1.2');
        fail('Expected HttpException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect((e as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });

    it('should delete key when entries array is empty', () => {
      const map = (guard as any).ipLimitMap;
      map.set('192.168.1.3', []);

      (guard as any).checkIpLimit('192.168.1.3');

      // After calling with empty entries, the key should have exactly 1 entry (newly added timestamp)
      expect(map.get('192.168.1.3')).toHaveLength(1);
    });

    it('should allow different IPs independently', () => {
      (guard as any).checkIpLimit('10.0.0.1');
      (guard as any).checkIpLimit('10.0.0.1');
      (guard as any).checkIpLimit('10.0.0.1');

      expect(() => (guard as any).checkIpLimit('10.0.0.2')).not.toThrow();
    });
  });

  describe('canActivate', () => {
    beforeEach(() => {
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' } as any);
    });

    it('should return true when no rate limit triggered', async () => {
      const context = createMockContext('device-123', '192.168.1.1');
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should call checkDeviceLimit when device_id provided', async () => {
      const context = createMockContext('device-123', '192.168.1.1');
      const checkDeviceSpy = jest.spyOn(guard as any, 'checkDeviceLimit');

      await guard.canActivate(context);

      expect(checkDeviceSpy).toHaveBeenCalledWith('device-123');
    });

    it('should call checkIpLimit when ip provided', async () => {
      const context = createMockContext('device-123', '192.168.1.1');
      const checkIpSpy = jest.spyOn(guard as any, 'checkIpLimit');

      await guard.canActivate(context);

      expect(checkIpSpy).toHaveBeenCalledWith('192.168.1.1');
    });

    it('should return true even when device_id is empty', async () => {
      const context = createMockContext(undefined, '192.168.1.1');
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
