/**
 *
 * output error 数据
 */
export interface IErrorData {
  /**
   * http 状态码
   */
  statusCode: number;
  /**
   * 自定义 code 码
   */
  code: number;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 错误详情
   */
  stack?: string;
  /**
   * 访问地址
   */
  path?: string;
  /**
   * 错误类型
   */
  errorType?: string;
  /**
   * 时间戳
   */
  timestamp?: string;
}

/**
 * 扩展参数, 可覆盖 IErrorData
 */
export interface IExtendData {
  message?: string;
}
