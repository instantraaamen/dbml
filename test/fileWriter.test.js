const fs = require('fs');
const path = require('path');
const {
  ensureDirectoryExists,
  writeCSVFile,
  writeMultipleCSVFiles,
  writeTableCSVFiles
} = require('../pkg/fileWriter');

const TEST_DIR = path.join(__dirname, 'temp');

describe('File Writer', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      try {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
      } catch (error) {
        // macOSでのファイル削除エラーを無視
        console.warn(
          'Warning: Could not clean up test directory:',
          error.message
        );
      }
    }
  });

  describe('ensureDirectoryExists', () => {
    test('should create directory if it does not exist', () => {
      const testPath = path.join(TEST_DIR, 'new_dir');

      expect(fs.existsSync(testPath)).toBe(false);

      ensureDirectoryExists(testPath);

      expect(fs.existsSync(testPath)).toBe(true);
      expect(fs.statSync(testPath).isDirectory()).toBe(true);
    });

    test('should not throw error if directory already exists', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });

      expect(() => {
        ensureDirectoryExists(TEST_DIR);
      }).not.toThrow();
    });

    test('should create nested directories', () => {
      const nestedPath = path.join(TEST_DIR, 'level1', 'level2', 'level3');

      ensureDirectoryExists(nestedPath);

      expect(fs.existsSync(nestedPath)).toBe(true);
    });
  });

  describe('writeCSVFile', () => {
    test('should write CSV content to file', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      const filePath = path.join(TEST_DIR, 'test.csv');
      const csvContent = 'Name,Age\nJohn,30\nJane,25';

      writeCSVFile(filePath, csvContent);

      expect(fs.existsSync(filePath)).toBe(true);
      const writtenContent = fs.readFileSync(filePath, 'utf8');
      expect(writtenContent).toBe(csvContent);
    });

    test('should overwrite existing file', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      const filePath = path.join(TEST_DIR, 'test.csv');

      writeCSVFile(filePath, 'old content');
      writeCSVFile(filePath, 'new content');

      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toBe('new content');
    });
  });

  describe('writeMultipleCSVFiles', () => {
    test('should write multiple CSV files', () => {
      const csvFiles = {
        'file1.csv': 'Name,Age\nJohn,30',
        'file2.csv': 'Product,Price\nBook,1000',
        'summary.csv': 'Total,2'
      };

      const result = writeMultipleCSVFiles(TEST_DIR, csvFiles);

      expect(result).toEqual(['file1.csv', 'file2.csv', 'summary.csv']);

      Object.entries(csvFiles).forEach(([fileName, expectedContent]) => {
        const filePath = path.join(TEST_DIR, fileName);
        expect(fs.existsSync(filePath)).toBe(true);
        const actualContent = fs.readFileSync(filePath, 'utf8');
        expect(actualContent).toBe(expectedContent);
      });
    });

    test('should create output directory if it does not exist', () => {
      const csvFiles = { 'test.csv': 'data' };

      expect(fs.existsSync(TEST_DIR)).toBe(false);

      writeMultipleCSVFiles(TEST_DIR, csvFiles);

      expect(fs.existsSync(TEST_DIR)).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'test.csv'))).toBe(true);
    });
  });

  describe('writeTableCSVFiles', () => {
    test('should write CSV files for each table', () => {
      const tables = [
        { name: 'users', fields: [{ name: 'id' }, { name: 'name' }] },
        { name: 'products', fields: [{ name: 'id' }, { name: 'title' }] }
      ];

      const mockConverter = jest.fn((table) => `${table.name} CSV content`);

      const result = writeTableCSVFiles(TEST_DIR, tables, mockConverter);

      expect(result).toEqual(['users.csv', 'products.csv']);
      expect(mockConverter).toHaveBeenCalledTimes(2);
      expect(mockConverter).toHaveBeenCalledWith(tables[0]);
      expect(mockConverter).toHaveBeenCalledWith(tables[1]);

      // Check files are created with correct content
      const usersContent = fs.readFileSync(
        path.join(TEST_DIR, 'users.csv'),
        'utf8'
      );
      expect(usersContent).toBe('users CSV content');

      const productsContent = fs.readFileSync(
        path.join(TEST_DIR, 'products.csv'),
        'utf8'
      );
      expect(productsContent).toBe('products CSV content');
    });

    test('should handle empty tables array', () => {
      const mockConverter = jest.fn();

      const result = writeTableCSVFiles(TEST_DIR, [], mockConverter);

      expect(result).toEqual([]);
      expect(mockConverter).not.toHaveBeenCalled();
      expect(fs.existsSync(TEST_DIR)).toBe(true); // Directory should still be created
    });

    test('should create output directory', () => {
      const tables = [{ name: 'test', fields: [] }];
      const mockConverter = () => 'test content';

      expect(fs.existsSync(TEST_DIR)).toBe(false);

      writeTableCSVFiles(TEST_DIR, tables, mockConverter);

      expect(fs.existsSync(TEST_DIR)).toBe(true);
    });
  });
});
