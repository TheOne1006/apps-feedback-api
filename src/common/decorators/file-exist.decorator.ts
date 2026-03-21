import * as fs from 'fs-extra';

/**
 * 如果文件存在，且无需更新则直接返回文件路径
 * @param getFilePath
 */
export function FileExist(
  getFilePath: (...fileArgs: any) => string,
): MethodDecorator {
  return (_, __, descriptor: PropertyDescriptor) => {
    const originalFunction = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const filePath = getFilePath.call(this, ...args);
        if (
          filePath &&
          typeof filePath === 'string' &&
          fs.statSync(filePath).isFile()
        ) {
          return filePath;
        }
      } catch (error) {
        // ignore
        // console.error(error);
      }

      return originalFunction.apply(this, args);
    };

    return descriptor;
  };
}
