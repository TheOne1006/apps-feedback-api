import {
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { BaseExceptionsFilter } from './base-exception.filter';

/**
 * 处理所有 BadRequest
 *
 * 可能会出现校验错误产生的 4xx
 */
@Catch(BadRequestException)
export class BadRequestFilter
  extends BaseExceptionsFilter
  implements ExceptionFilter
{
  protected readonly type = 'bad-request';

  catch(exception: HttpException, host: ArgumentsHost) {
    const statusCode = exception.getStatus();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.warn(`BadRequest: ${exception}`);
    this.logger.warn(exception.stack);

    this.output(response, statusCode, statusCode, exception, request);
  }
}
