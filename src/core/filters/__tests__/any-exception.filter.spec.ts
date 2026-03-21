import { HttpException, ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { Logger } from 'winston';

import { AnyExceptionsFilter } from '../any-exception.filter';

describe('filters any-exception.filter', () => {
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
    it('should ouput status with exception1', () => {
      const filter = new AnyExceptionsFilter(mockLogger);

      filter.output = jest.fn();

      const err = new HttpException('err', 204);

      filter.catch(err, mockHost);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(filter.output).toHaveBeenCalledTimes(1);
    });

    it('should ouput status with exception2', () => {
      const filter = new AnyExceptionsFilter(mockLogger);

      filter.output = jest.fn();

      const err = new HttpException('err', 204);

      filter.catch(err, mockHost);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(filter.output).toHaveBeenCalledTimes(1);

      expect(filter.output).toHaveBeenCalledWith({}, 204, 204, err, {
        url: '/test',
      });
    });

    it('should ouput default status', () => {
      const filter = new AnyExceptionsFilter(mockLogger);

      filter.output = jest.fn();

      const err = new Error('err');

      filter.catch(err, mockHost);

      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(filter.output).toHaveBeenCalledTimes(1);
      expect(filter.output).toHaveBeenCalledWith({}, 500, 500, err, {
        url: '/test',
      });
    });
  });
});
