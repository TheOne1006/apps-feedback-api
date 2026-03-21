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

import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CreateFeedbackDto } from './dtos';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

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
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    for (const image of images) {
      const imageId = uuidv4();
      const ext = mimeToExt[image.mimetype] ?? '.jpg';
      const filename = `${imageId}${ext}`;
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
