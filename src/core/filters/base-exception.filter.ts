import { ExceptionFilter, Inject, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IErrorData } from './base-exception.interface';

/**
 * 异常处理 基础基础过滤器
 */
export abstract class BaseExceptionsFilter implements ExceptionFilter {
  protected readonly type: string = 'base';

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    this.logger.warn(`in ${request.url}`);
    this.logger.error((exception as any).stack);

    throw new Error('Method is need rebuild.');
  }

  output(
    res: Response,
    statusCode: number,
    code: number,
    exception: Error,
    req: Request,
  ) {
    const data: IErrorData = {
      statusCode: statusCode,
      code: code,
      message: exception.message,
    };

    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production') {
      data.path = req.url;
      data.stack = exception.stack;
      data.errorType = this.type;
      data.timestamp = new Date().toISOString();
    }

    res.status(statusCode).json({
      ...data,
    });
  }
}
