import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { BaseExceptionsFilter } from './base-exception.filter';

/**
 * 所有异常处理器
 *
 * 处理所有异常
 */
@Catch()
export class AnyExceptionsFilter
  extends BaseExceptionsFilter
  implements ExceptionFilter
{
  protected readonly type: string = 'any';

  /**
   * catch 方法
   * @param  {Error} exception
   * @param  {ArgumentsHost} host
   */
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`AnyExceptions: ${exception}`);
    this.logger.error(exception.stack);

    this.output(response, status, status, exception, request);
  }
}
