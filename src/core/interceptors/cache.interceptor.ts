import { Injectable, ExecutionContext, CallHandler, Inject, SetMetadata } from '@nestjs/common';
import {
  CacheInterceptor,
  CACHE_MANAGER,
  CACHE_TTL_METADATA,
} from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export type CacheKeyByConfig = {
  params?: string[];
  query?: string[];
};

export const CACHE_KEY_BY_METADATA = 'CACHE_KEY_BY_METADATA';

export const CacheKeyBy = (config: CacheKeyByConfig) =>
  SetMetadata(CACHE_KEY_BY_METADATA, config);

@Injectable()
export class RefreshableCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    protected readonly reflector: Reflector,
  ) {
    super(cacheManager as any, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const cacheKeyBy = this.reflector.getAllAndOverride<CacheKeyByConfig | undefined>(
      CACHE_KEY_BY_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (cacheKeyBy) {
      const baseKey = `${context.getClass().name}:${context.getHandler().name}`;
      const parts: string[] = [];

      for (const key of cacheKeyBy.params || []) {
        parts.push(`p.${key}=${String(request.params?.[key] ?? '')}`);
      }
      for (const key of cacheKeyBy.query || []) {
        parts.push(`q.${key}=${String(request.query?.[key] ?? '')}`);
      }

      return parts.length ? `${baseKey}|${parts.join('&')}` : baseKey;
    }

    const key = super.trackBy(context);
    if (!key) return key;

    try {
      const url = new URL(key, 'http://localhost');
      url.searchParams.delete('refresh');
      const search = url.searchParams.toString();
      return search ? `${url.pathname}?${search}` : url.pathname;
    } catch {
      return key;
    }
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const refresh = request.query?.refresh === 'true' || request.query?.refresh === true;

    const cacheKey = this.trackBy(context);
    if (!cacheKey) return next.handle();

    if (refresh) {
      await this.cacheManager.del(cacheKey);
    }

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData !== undefined && cachedData !== null) {
      return of(cachedData);
    }

    const ttl = this.reflector.getAllAndOverride<number | undefined>(
      CACHE_TTL_METADATA,
      [context.getHandler(), context.getClass()],
    );
    return next.handle().pipe(
      tap((data) => {
        if (ttl === undefined || ttl === null) {
          void (this.cacheManager as any).set(cacheKey, data);
          return;
        }
        void (this.cacheManager as any).set(cacheKey, data, ttl);
      }),
    );
  }
}
