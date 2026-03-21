// Mock uuid module (must be before imports)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4'),
}));

// Mock fs module (must be before imports)
jest.mock('fs/promises');

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
      (mockService.createFeedback as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.create(dto, { images: [] });

      expect(result).toEqual({
        code: 201,
        message: 'Feedback submitted successfully',
        data: mockResult,
      });
    });

    it('should call service with correct params', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      (mockService.createFeedback as jest.Mock).mockResolvedValue({ id: '1', created_at: 'now' });

      await controller.create(dto, { images: [] });

      expect(mockService.createFeedback).toHaveBeenCalledWith(
        dto,
        []
      );
    });

    it('should pass images to service', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      const mockImages = [{ buffer: Buffer.from('img') }] as Express.Multer.File[];
      (mockService.createFeedback as jest.Mock).mockResolvedValue({ id: '1', created_at: 'now' });

      await controller.create(dto, { images: mockImages });

      expect(mockService.createFeedback).toHaveBeenCalledWith(
        dto,
        mockImages
      );
    });

    it('should handle service errors', async () => {
      const dto = { content: 'Test', device_id: 'device-123' };
      (mockService.createFeedback as jest.Mock).mockRejectedValue(
        new HttpException('Rate limit exceeded', 429)
      );

      await expect(controller.create(dto, { images: [] })).rejects.toThrow(HttpException);
    });
  });
});
