import { Get } from '@nestjs/common';
import {
  RESPONSE_SUCCESS_CODE,
  RESPONSE_SUCCESS_MESSAGE,
  // DEFAULT_RESPONSE_SUCCESS_CODE,
  // DEFAULT_RESPONSE_SUCCESS_MESSAGE,
} from '../../../common/constants';

import { ResSuccessCode, ResSuccessMessage } from '../response.decorator';

describe('defined response code', () => {
  describe('with custom code and message', () => {
    class TestClass {
      @Get('foo')
      @ResSuccessCode(200)
      @ResSuccessMessage('custom result')
      static foo() {
        return 'foo';
      }
    }

    it('get custom success msg', () => {
      const actualCode = Reflect.getMetadata(
        RESPONSE_SUCCESS_CODE,
        TestClass.foo,
      );
      const actualMsg = Reflect.getMetadata(
        RESPONSE_SUCCESS_MESSAGE,
        TestClass.foo,
      );
      expect(actualCode).toEqual(200);
      expect(actualMsg).toEqual('custom result');
    });
  });

  describe('with different code and message', () => {
    class TestClass {
      @Get('foo')
      @ResSuccessCode(30000)
      @ResSuccessMessage('long long custom result')
      static foo() {
        return 'foo';
      }
    }

    it('get custom success msg', () => {
      const actualCode = Reflect.getMetadata(
        RESPONSE_SUCCESS_CODE,
        TestClass.foo,
      );
      const actualMsg = Reflect.getMetadata(
        RESPONSE_SUCCESS_MESSAGE,
        TestClass.foo,
      );
      expect(actualCode).toEqual(30000);
      expect(actualMsg).toEqual('long long custom result');
    });
  });
});
