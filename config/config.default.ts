import * as dotenv from 'dotenv';

/**
 * 启动 .env 配置信息
 */
dotenv.config();

/**
 * @ignore
 * 配置项接口
 */
export interface Iconfig {
  logger: {
    appName: string;
    level: string;
    filename?: string;
    timestamp?: boolean;
    uncolorize?: boolean;
  };
  language: string;
  swagger: {
    enable: boolean;
    endPoint: string;
  };
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

/**
 * @ignore
 * 默认配置信息
 */
export const config: Iconfig = {
  language: 'zh-cn',
  logger: {
    appName: 'example',
    level: 'info',
    timestamp: true,
    // filename: 'log/all.log',
  },
  swagger: {
    enable: process.env.DOC_SWAGGE === 'true',
    endPoint: 'api',
  },
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
};
