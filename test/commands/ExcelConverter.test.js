const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const ExcelConverter = require('../../lib/commands/ExcelConverter');
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

describe('ExcelConverter', () => {
  beforeEach(() => {
    // 各テストで独立したディレクトリを作成
    TEST_DIR = createUniqueTestDir('excelConverter');
  });

  afterEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    if (TEST_DIR) {
      await cleanupTestDir(TEST_DIR);
    }
  });

  describe('constructor', () => {
    test('should create ExcelConverter instance with correct format', () => {
      const converter = new ExcelConverter();
      expect(converter).toBeInstanceOf(ExcelConverter);
      expect(converter.format).toBe('xlsx');
    });
  });

  describe('convert', () => {
    test('should convert DBML to Excel format', async () => {
      const converter = new ExcelConverter();
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);
      await waitForFileReady(testDbmlFile);

      const result = await converter.convert(testDbmlFile, outputFile);

      expect(result).toEqual({
        format: 'xlsx',
        filePath: outputFile,
        worksheets: ['テーブル一覧', 'users', 'products'],
        tablesCount: 2
      });

      expect(fs.existsSync(outputFile)).toBe(true);
    });

    test('should create valid Excel file with correct content', async () => {
      const converter = new ExcelConverter();
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);
      await waitForFileReady(testDbmlFile);

      await converter.convert(testDbmlFile, outputFile);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputFile);

      // 生成されたExcelファイルを読み込んで検証
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(outputFile);

      const overviewSheet = workbook.getWorksheet('テーブル一覧');
      expect(overviewSheet).toBeDefined();

      // ヘッダー行の確認
      const headerRow = overviewSheet.getRow(1);
      expect(headerRow.getCell(1).value).toBe('テーブル名');
      expect(headerRow.getCell(2).value).toBe('説明');
      expect(headerRow.getCell(3).value).toBe('フィールド数');

      // データ行の確認
      const usersRow = overviewSheet.getRow(2);
      expect(usersRow.getCell(1).value).toBe('users');
      expect(usersRow.getCell(2).value).toBe('ユーザー情報テーブル');
      expect(usersRow.getCell(3).value).toBe(4);
    });

    test('should handle invalid DBML file', async () => {
      const converter = new ExcelConverter();
      const nonExistentFile = path.join(TEST_DIR, 'nonexistent.dbml');
      const outputFile = path.join(TEST_DIR, 'output.xlsx');

      await expect(
        converter.convert(nonExistentFile, outputFile)
      ).rejects.toThrow('DBML file not found');
    });

    test('should use default output path when not specified', async () => {
      const converter = new ExcelConverter();
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);
      await waitForFileReady(testDbmlFile);

      const result = await converter.convert(testDbmlFile, null);

      expect(result.filePath).toBe(path.join(TEST_DIR, 'test.xlsx'));
      expect(result.tablesCount).toBe(2);
      expect(fs.existsSync(result.filePath)).toBe(true);
    });
  });
});
