import { SetMetadata } from '@nestjs/common';
import { RESPONSE_SUCCESS_CODE, RESPONSE_SUCCESS_MESSAGE } from '../constants';

/**
 * 设置响应 code
 * @param  {number} code
 * @returns number
 */
export const ResSuccessCode = (code: number) =>
  SetMetadata(RESPONSE_SUCCESS_CODE, code);

/**
 * 设置正确响应的 message
 * @param  {string} message
 */
export const ResSuccessMessage = (message: string) =>
  SetMetadata(RESPONSE_SUCCESS_MESSAGE, message);
