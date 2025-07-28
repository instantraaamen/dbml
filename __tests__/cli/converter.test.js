const fs = require('fs');
const path = require('path');
const {
  convertToFormat,
  resolveOutputPath
} = require('../../src/cli/converter');

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(__dirname, '../temp');

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

describe('CLI Converter', () => {
  beforeEach(() => {
    // テスト用ディレクトリを作成
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // テスト用ファイルをクリーンアップ
    if (fs.existsSync(TEST_DIR)) {
      try {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
      } catch (error) {
        console.warn(
          'Warning: Could not clean up test directory:',
          error.message
        );
      }
    }
  });

  describe('convertToFormat', () => {
    test('should convert DBML to CSV format', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputDir = path.join(TEST_DIR, 'csv_output');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const result = await convertToFormat(testDbmlFile, outputDir, 'csv');

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

    test('should convert DBML to Excel format', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const result = await convertToFormat(testDbmlFile, outputFile, 'xlsx');

      expect(result).toEqual({
        format: 'xlsx',
        filePath: outputFile,
        worksheets: ['テーブル一覧', 'users', 'products'],
        tablesCount: 2
      });

      expect(fs.existsSync(outputFile)).toBe(true);
    });

    test('should handle single CSV file output', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'overview.csv');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const result = await convertToFormat(testDbmlFile, outputFile, 'csv');

      expect(result).toEqual({
        format: 'csv',
        filePath: outputFile,
        tablesCount: 2
      });

      expect(fs.existsSync(outputFile)).toBe(true);
    });

    test('should throw error for unsupported format', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      await expect(
        convertToFormat(testDbmlFile, TEST_DIR, 'unsupported')
      ).rejects.toThrow('Unsupported format: unsupported');
    });

    test('should throw error for invalid DBML file', async () => {
      const nonExistentFile = path.join(TEST_DIR, 'nonexistent.dbml');

      await expect(
        convertToFormat(nonExistentFile, TEST_DIR, 'csv')
      ).rejects.toThrow('DBML file not found');
    });

    test('should use default output path when not specified', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const result = await convertToFormat(testDbmlFile, null, 'xlsx');

      expect(result.filePath).toBe(path.join(TEST_DIR, 'test.xlsx'));
      expect(fs.existsSync(result.filePath)).toBe(true);
    });
  });

  describe('resolveOutputPath', () => {
    test('should return provided output path when specified', () => {
      const result = resolveOutputPath(
        '/input/test.dbml',
        '/output/result.xlsx',
        'xlsx'
      );
      expect(result).toBe('/output/result.xlsx');
    });

    test('should generate default Excel output path', () => {
      const result = resolveOutputPath('/input/test.dbml', null, 'xlsx');
      expect(result).toBe('/input/test.xlsx');
    });

    test('should generate default CSV directory path', () => {
      const result = resolveOutputPath('/input/test.dbml', null, 'csv');
      expect(result).toBe('/input/test_csv');
    });

    test('should handle input files without extension', () => {
      const result = resolveOutputPath('/input/test', null, 'xlsx');
      expect(result).toBe('/input/test.xlsx');
    });

    test('should use input directory for unknown format', () => {
      const result = resolveOutputPath('/input/test.dbml', null, 'unknown');
      expect(result).toBe('/input');
    });
  });
});
