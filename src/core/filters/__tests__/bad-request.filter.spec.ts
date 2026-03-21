import { HttpException, ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { Logger } from 'winston';

import { BadRequestFilter } from '../bad-request.filter';

describe('filters bad-request.filter', () => {
  let mockLogger: Logger;
  let mockHost: ArgumentsHost;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    } as any as Logger;

    const mockRequest = { url: '/test' };
    const mockResponse = {};
    mockContext = {
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    } as any as ExecutionContext;

    mockHost = {
      switchToHttp: () => mockContext,
    } as any as ArgumentsHost;
  });

  describe('catch', () => {

    it('should ouput without extend', () => {
      const filter = new BadRequestFilter(mockLogger);

      filter.output = jest.fn();

      const err = new HttpException('err', 204);

      filter.catch(err, mockHost);

      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
      expect(filter.output).toHaveBeenCalledTimes(1);

      expect(filter.output).toHaveBeenCalledWith({}, 204, 204, err, {
        url: '/test'
      });
    });
  });
});
