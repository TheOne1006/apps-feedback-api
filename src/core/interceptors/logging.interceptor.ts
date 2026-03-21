import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * 响应时长超过 200 ms
 */
const MAX_LIMIT = 200;

/**
 * 慢日志 拦截器
 * 记录响应时长超过 MAX_LIMIT ms 的请求，将会被记录
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const reqUrl = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const useTime = Date.now() - now;

        if (useTime >= MAX_LIMIT) {
          this.logger.warn(`slow request ${reqUrl} use ${Date.now() - now}ms`);
        }
      }),
    );
  }
}
