/* istanbul ignore file */
/**
 * winstorn 日志管理
 */
import { Module } from '@nestjs/common';
import { transports, format, LoggerOptions } from 'winston';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import { config } from '../../../config';

/**
 * 日志配置
 */
const loggerConfig = config.logger;

/**
 * logger服务参数
 */
let loggerOptions: LoggerOptions;

/**
 * 日志格式化参数
 * 是否添加日志时间
 */
const formatArgs = [
  nestWinstonModuleUtilities.format.nestLike(loggerConfig.appName || 'example'),
];
if (loggerConfig?.timestamp) {
  formatArgs.unshift(format.timestamp());
}
if (loggerConfig?.uncolorize) {
  formatArgs.push(format.uncolorize());
}

if (!loggerConfig.filename) {
  loggerOptions = {
    transports: [
      new transports.Console({
        format: format.combine(...formatArgs),
        ...loggerConfig,
      }),
    ],
  };
} else {
  loggerOptions = {
    transports: [
      new transports.File({
        format: format.combine(...formatArgs),
        maxFiles: 5,
        maxsize: 5242880,
        ...loggerConfig,
      }),
    ],
  };
}

/**
 * logger 模块
 */
const loggerModule = WinstonModule.forRoot(loggerOptions);

@Module({
  imports: [loggerModule],
  exports: [loggerModule],
})
export class LoggerModule {}
