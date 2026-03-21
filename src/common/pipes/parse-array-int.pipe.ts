import {
  // ArgumentMetadata,
  Injectable,
  // PipeTransform,
  // ParseArrayPipe,
} from '@nestjs/common';

import { ParseJsonPipe } from './parse-json.pipe';

/**
 * 管道 将字符串 转换为 数字数组
 * '1,2,3' => [1,2,3]
 */
@Injectable()
export class ParseArrayInt extends ParseJsonPipe {
  async transform(value: string): Promise<number[] | undefined> {
    if (!value) {
      return undefined;
    }

    const values = await super.transform(value);

    if (values && values.length) {
      return values.map((str: string) => {
        if (typeof str === 'string') {
          return parseInt(str, 10);
        }
        return str;
      });
    }

    return [];
  }
}
