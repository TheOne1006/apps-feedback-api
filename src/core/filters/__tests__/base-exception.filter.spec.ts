import {
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { Logger } from 'winston';
// import { createMock } from '@golevelup/ts-jest';

import { BaseExceptionsFilter } from '../base-exception.filter';

class MockBaseExceptionsFilter
  extends BaseExceptionsFilter
  implements ExceptionFilter {}

describe('filters base-exception.filter', () => {
  let mockLogger: Logger;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    } as any as Logger;

    // const context = createMock<ExecutionContext>();

    const mockRequest = { url: '/test' };
    const mockResponse = {};
    const mockContext = {
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    };

    mockHost = {
      switchToHttp: () => mockContext,
    } as any as ArgumentsHost;
  });

  describe('catch', () => {
    it('should ouput with exception', () => {
      const filter = new MockBaseExceptionsFilter(mockLogger);

      filter.output = jest.fn();

      const err = new HttpException('err', 204);

      try {
        filter.catch(err, mockHost);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
   
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });
  });
});
