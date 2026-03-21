import {
  ArgumentMetadata,
  Injectable,
  // PipeTransform,
  ParseIntPipe,
} from '@nestjs/common';

/**
 * 管道 将字符串 转换为 数字
 * '1' => 1
 */
@Injectable()
export class ParseInt extends ParseIntPipe {
  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    if (!value) {
      return 0;
    }

    return super.transform(value, metadata);
  }
}
