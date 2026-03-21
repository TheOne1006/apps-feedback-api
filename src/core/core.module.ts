import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import {
  LoggingInterceptor,
  WrapResponceInterceptor
} from './interceptors';
import {
  AnyExceptionsFilter,
  BadRequestFilter,
  HttpExceptionFilter,
} from './filters';
import { LoggerModule } from './logger';

@Module({
  imports: [LoggerModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: WrapResponceInterceptor },
    {
      provide: APP_FILTER,
      useClass: AnyExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestFilter,
    },
  ],
})
export class CoreModule {}
