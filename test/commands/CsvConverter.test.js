const fs = require('fs');
const path = require('path');
const CsvConverter = require('../../lib/commands/CsvConverter');
const {
  createUniqueTestDir,
  cleanupTestDir,
  waitForFileReady
} = require('../helpers/testUtils');

// テスト用の一時ディレクトリ（各テストで独立）
let TEST_DIR;

// テスト用のDBMLファイル内容
const TEST_DBML_CONTENT = `
Table users {
  id bigint [pk, increment, note: 'ユーザーID']
  name varchar(100) [not null, note: 'ユーザー名']
  email varchar(255) [not null, unique, note: 'メールアドレス']
  created_at timestamp [default: 'CURRENT_TIMESTAMP', note: '作成日時']
  
  Note: 'ユーザー情報テーブル'
}

Table products {
  id bigint [pk, increment, note: '商品ID']
  name varchar(200) [not null, note: '商品名']
  price decimal(10,2) [not null, note: '価格']
  
  Note: '商品情報テーブル'
}
`;

describe('CsvConverter', () => {
  beforeEach(() => {
    // 各テストで独立したディレクトリを作成
    TEST_DIR = createUniqueTestDir('csvConverter');
  });

  afterEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    if (TEST_DIR) {
      await cleanupTestDir(TEST_DIR);
    }
  });

  describe('constructor', () => {
    test('should create CsvConverter instance with correct format', () => {
      const converter = new CsvConverter();
      expect(converter).toBeInstanceOf(CsvConverter);
      expect(converter.format).toBe('csv');
    });
  });

  describe('convert', () => {
    test('should convert DBML to CSV directory format', async () => {
      const converter = new CsvConverter();
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputDir = path.join(TEST_DIR, 'csv_output');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);
      await waitForFileReady(testDbmlFile);

      const result = await converter.convert(testDbmlFile, outputDir);

      expect(result).toEqual({
        format: 'csv',
        outputDirectory: outputDir,
        files: expect.arrayContaining([
          'tables_overview.csv',
          'users.csv',
          'products.csv'
        ]),
        tablesCount: 2
      });

      // ファイルが実際に作成されていることを確認
      expect(fs.existsSync(path.join(outputDir, 'tables_overview.csv'))).toBe(
        true
      );
      expect(fs.existsSync(path.join(outputDir, 'users.csv'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'products.csv'))).toBe(true);
    });

    test('should convert DBML to single CSV file format', async () => {
      const converter = new CsvConverter();
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'overview.csv');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);
      await waitForFileReady(testDbmlFile);

      const result = await converter.convert(testDbmlFile, outputFile);

      expect(result).toEqual({
        format: 'csv',
        filePath: outputFile,
        tablesCount: 2
      });

      expect(fs.existsSync(outputFile)).toBe(true);
    });

    test('should handle invalid DBML file', async () => {
      const converter = new CsvConverter();
      const nonExistentFile = path.join(TEST_DIR, 'nonexistent.dbml');
      const outputDir = path.join(TEST_DIR, 'csv_output');

      await expect(
        converter.convert(nonExistentFile, outputDir)
      ).rejects.toThrow('DBML file not found');
    });

    test('should use default output path when not specified', async () => {
      const converter = new CsvConverter();
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);
      await waitForFileReady(testDbmlFile);

      const result = await converter.convert(testDbmlFile, null);

      expect(result.outputDirectory).toBe(path.join(TEST_DIR, 'test_csv'));
      expect(result.tablesCount).toBe(2);
    });
  });
});
