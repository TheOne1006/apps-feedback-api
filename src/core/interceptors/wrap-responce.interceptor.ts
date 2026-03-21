import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  RESPONSE_SUCCESS_CODE,
  RESPONSE_SUCCESS_MESSAGE,
  DEFAULT_RESPONSE_SUCCESS_CODE,
  DEFAULT_RESPONSE_SUCCESS_MESSAGE,
} from '../../common/constants';

// export interface Response<T> {
//   data: T;
// }

@Injectable()
export class WrapResponceInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const code = this.getSuccessCode(context);
    const message = this.getSuccessMessage(context);
    // 强制使用 json type
    const isFocreJsonContentType = this.isFocreJsonContentType(context);

    return next.handle().pipe(
      map((data) => {
        const type = typeof data;
        if (type === 'string' && isFocreJsonContentType) {
          return `{"code":${code}, "message": "${message}", "data": ${data}}`;
        } else {
          return {
            code,
            message,
            data,
          };
        }
      }),
    );
  }

  private getSuccessCode(context: ExecutionContext): number {
    const code = this.getMetaData<number>(RESPONSE_SUCCESS_CODE, context);

    return code || DEFAULT_RESPONSE_SUCCESS_CODE;
  }

  private getSuccessMessage(context: ExecutionContext): string {
    const message = this.getMetaData<string>(RESPONSE_SUCCESS_MESSAGE, context);

    return message || DEFAULT_RESPONSE_SUCCESS_MESSAGE;
  }

  /**
   * 前端是否 需要json格式解析
   * @param context
   */
  private isFocreJsonContentType(context: ExecutionContext): boolean {
    const headers = this.reflector.get<any[]>(
      HEADERS_METADATA,
      context.getHandler(),
    );

    const forceJson =
      headers?.length &&
      headers.some(
        (setting) =>
          setting.name === 'Content-Type' &&
          setting.value === 'application/json',
      );

    return forceJson;
  }

  /**
   * 获取 meta 数据,优先从 method 获取
   * @param key
   * @param context
   */
  private getMetaData<P>(key: string | symbol, context: ExecutionContext) {
    let meta = this.reflector.get<P>(key, context.getHandler());

    // 支持 meat 为 0
    if (typeof meta === 'number') {
      return meta;
    }

    if (!meta) {
      meta = this.reflector.get<P>(key, context.getClass());
    }

    return meta;
  }
}
