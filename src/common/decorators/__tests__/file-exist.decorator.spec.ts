// import * as fs from 'fs-extra';
import { join } from 'path';
import { FileExist } from '../file-exist.decorator';

describe('decorators FileExist', () => {
  describe('should support failed', () => {
    const mocksDir = join(__dirname, '__mocks__');
    // const file1Path = join(mocksDir, 'file1');
    const file2Path = join(mocksDir, 'file2');

    const mockCreateFile = jest.fn();

    const mockFileExists = jest
      .fn()
      .mockReturnValueOnce('')
      .mockReturnValueOnce(123)
      .mockReturnValueOnce(file2Path)
      .mockReturnValueOnce(new Error('error'));

    class TestClass {
      @FileExist(mockFileExists)
      createFile(path: string) {
        return mockCreateFile(path);
      }
    }

    it('should support failed return', () => {
      const testObj = new TestClass();

      testObj.createFile(file2Path);
      expect(mockCreateFile).toHaveBeenCalled();

      testObj.createFile(file2Path);
      expect(mockCreateFile).toHaveBeenCalledTimes(2);

      testObj.createFile(file2Path);
      expect(mockCreateFile).toHaveBeenCalledTimes(3);
    });

    it('should support ignore throw error', () => {
      const testObj = new TestClass();

      testObj.createFile(file2Path);
      expect(mockCreateFile).toHaveBeenCalledTimes(4);
    });
  });

  describe('should support exist', () => {
    const mocksDir = join(__dirname, '__mocks__');
    const file1Path = join(mocksDir, 'file1');
    const file2Path = join(mocksDir, 'file2');

    const mockCreateFile = jest.fn();

    const mockFileExists = jest.fn().mockReturnValueOnce(file1Path);

    class TestClass {
      @FileExist(mockFileExists)
      createFile(path: string) {
        return mockCreateFile(path);
      }
    }

    it('should support with cache', () => {
      const testObj = new TestClass();

      testObj.createFile(file2Path);
      expect(mockCreateFile).toHaveBeenCalledTimes(0);
    });
  });
});
