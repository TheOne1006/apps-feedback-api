import { HttpException, ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { Logger } from 'winston';
// import { createMock } from '@golevelup/ts-jest';

import { HttpExceptionFilter } from '../http-exception.filter';

describe('filters http-exception.filter', () => {
  let mockLogger: Logger;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    } as any as Logger;

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
    it('should ouput status with exception', () => {
      const filter = new HttpExceptionFilter(mockLogger);

      filter.output = jest.fn();

      const err = new HttpException('err', 204);

      filter.catch(err, mockHost);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(filter.output).toHaveBeenCalledTimes(1);
    });
  });
});
