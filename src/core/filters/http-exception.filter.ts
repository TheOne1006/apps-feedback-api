import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionsFilter } from './base-exception.filter';

/**
 * HttpException异常处理器
 *
 * 捕获 HttpException
 */
@Catch(HttpException)
export class HttpExceptionFilter
  extends BaseExceptionsFilter
  implements ExceptionFilter
{
  protected readonly type: string = 'http';

  /**
   * catch 方法
   * @param  {HttpException} exception
   * @param  {ArgumentsHost} host
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`HttpException: ${exception}`);
    this.logger.error(exception.stack);

    this.output(response, status, status, exception, request);
  }
}
