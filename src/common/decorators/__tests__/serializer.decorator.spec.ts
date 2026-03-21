import { Get } from '@nestjs/common';
import { SerializerClass } from '../serializer.decorator';
import { SERIALIZER_CLASS } from '../../constants';

describe('defined Serializer Class', () => {
  describe('with custom code and message', () => {
    class MockSerializerClass {
      id: number;

      type: string;
    }

    class TestClass {
      @Get('foo')
      @SerializerClass(MockSerializerClass)
      static foo() {
        return {
          id: '100',
          type: 'foo',
        };
      }
    }

    it('get Serializer Class', () => {
      const actualClass = Reflect.getMetadata(SERIALIZER_CLASS, TestClass.foo);
      expect(actualClass).toEqual(MockSerializerClass);
    });
  });
});
