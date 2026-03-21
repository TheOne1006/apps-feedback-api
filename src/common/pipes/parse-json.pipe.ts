import {
  // ArgumentMetadata,
  Injectable,
  ParseArrayPipe,
} from '@nestjs/common';

/**
 * 管道 将字符串 转换为 json
 * '[1,2,3]' => [1,2,3]
 */
@Injectable()
export class ParseJsonPipe extends ParseArrayPipe {
  async transform(value: string): Promise<any> {
    if (!value) return undefined;
    try {
      const object = JSON.parse(value);
      return object;
    } catch (error) {
      return {};
    }
  }
}
