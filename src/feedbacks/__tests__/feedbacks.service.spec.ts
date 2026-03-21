// Mock uuid module (must be before imports)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4'),
}));

// Mock fs module (must be before imports)
jest.mock('fs/promises');

import { Test, TestingModule } from '@nestjs/testing';
import { FeedbacksService, FeedbackEntry, FeedbackFile } from '../feedbacks.service';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('FeedbacksService', () => {
  let service: FeedbacksService;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbacksService],
    }).compile();

    service = module.get<FeedbacksService>(FeedbacksService);
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('should create feedback successfully', async () => {
      const dto = { content: 'Test feedback', device_id: 'device-123' };
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
        (call: any[]) => call[0].includes('device-123') && call[0].endsWith('.jpg')
      );
      expect(imageWriteCall).toBeDefined();
      expect(imageWriteCall![1]).toEqual(Buffer.from('fake-image'));
    });

    it('should use correct extension based on image mimetype', async () => {
      const dto = { content: 'Test feedback', device_id: 'device-123' };
      const mockFiles = [
        { buffer: Buffer.from('png-data'), mimetype: 'image/png' } as Express.Multer.File,
        { buffer: Buffer.from('gif-data'), mimetype: 'image/gif' } as Express.Multer.File,
        { buffer: Buffer.from('webp-data'), mimetype: 'image/webp' } as Express.Multer.File,
      ];

      mockFs.mkdir.mockResolvedValue(undefined as any);
      mockFs.readFile.mockRejectedValue({ code: 'ENOENT' } as any);
      mockFs.writeFile.mockResolvedValue(undefined as any);

      await service.createFeedback(dto, mockFiles);

      const writeCalls = mockFs.writeFile.mock.calls.filter(
        (call: any[]) => call[0].toString().includes('device-123')
      );

      expect(writeCalls.some((c) => c[0].toString().endsWith('.png'))).toBe(true);
      expect(writeCalls.some((c) => c[0].toString().endsWith('.gif'))).toBe(true);
      expect(writeCalls.some((c) => c[0].toString().endsWith('.webp'))).toBe(true);
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

      // With no images, only one writeFile call for the JSON file
      const writeCall = mockFs.writeFile.mock.calls[0];
      const writtenData = JSON.parse(writeCall[1] as string);
      expect(writtenData.feedbacks).toHaveLength(2);
      expect(writtenData.feedbacks[0].id).toBe('old-id');
      expect(writtenData.feedbacks[1].content).toBe('New feedback');
    });
  });
});
