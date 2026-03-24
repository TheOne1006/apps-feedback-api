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
  // In-memory storage: IP -> [timestamp, timestamp, ...]
  private ipLimitMap = new Map<string, number[]>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requestBody = request.body || {};
    const { device_id } = requestBody;

    // 获取真实客户端 IP (优先检查反向代理的请求头)
    const xForwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];

    let ip = request.ip || request.socket?.remoteAddress;
    
    if (xForwardedFor) {
      ip = typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0].trim() : xForwardedFor[0].trim();
    } else if (xRealIp) {
      ip = typeof xRealIp === 'string' ? xRealIp.trim() : xRealIp[0].trim();
    }

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
        console.warn(`Device ${device_id} hit rate limit. Recent count: ${recentCount}`);
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
      console.warn(`IP ${ip} hit rate limit. Retry in ${remainingMinutes} minutes.`);
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
