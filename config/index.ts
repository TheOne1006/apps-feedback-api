import { config as defaultConfig, Iconfig } from './config.default';
import  { config as devConfig } from './config.development';
import  { config as testConfig } from './config.unittest';
import  { config as prodConfig } from './config.production';

/**
 * 当前环境
 *
 * test 测试
 * production 生产
 * develop 开发
 */
const curenv = process.env.NODE_ENV;

/**
 * 扩展的config 信息
 */
let extendConfig: any = {};

switch (curenv) {
  case 'test': {
    extendConfig = testConfig;
    break;
  }
  /* istanbul ignore next */
  case 'production': {
    extendConfig = prodConfig;
    break;
  }
  /* istanbul ignore next */
  default: {
    extendConfig = devConfig;
    break;
  }
}

/**
 * 环境配置项
 */
export const config: Iconfig = {
  ...defaultConfig,
  ...extendConfig,
};
