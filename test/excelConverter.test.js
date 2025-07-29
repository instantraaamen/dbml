const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { convertDBMLToExcelFile } = require('../pkg/excelConverter');
const {
  createUniqueTestDir,
  cleanupTestDir,
  waitForFileReady
} = require('./helpers/testUtils');

// テスト用の一時ディレクトリ（各テストで独立）
let TEST_DIR;

// テスト用のDBMLファイル
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

describe('Excel Converter Integration Tests', () => {
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

  describe('convertDBMLToExcelFile', () => {
    test('should convert DBML file to Excel file', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputExcelFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const result = await convertDBMLToExcelFile(
        testDbmlFile,
        outputExcelFile
      );

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputExcelFile);

      expect(result.filePath).toBe(outputExcelFile);
      expect(result.tablesCount).toBe(2);
      expect(result.worksheets).toEqual(['テーブル一覧', 'users', 'products']);
      expect(fs.existsSync(outputExcelFile)).toBe(true);
    });

    test('should create valid Excel file with correct content', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputExcelFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      await convertDBMLToExcelFile(testDbmlFile, outputExcelFile);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputExcelFile);

      // 生成されたExcelファイルを読み込んで検証（エラーハンドリング強化）
      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.readFile(outputExcelFile);
      } catch (error) {
        throw new Error(
          `Failed to read Excel file: ${error.message}. File exists: ${fs.existsSync(outputExcelFile)}, File size: ${fs.existsSync(outputExcelFile) ? fs.statSync(outputExcelFile).size : 'N/A'}`
        );
      }

      // ワークシートの存在確認
      expect(workbook.getWorksheet('テーブル一覧')).toBeDefined();
      expect(workbook.getWorksheet('users')).toBeDefined();
      expect(workbook.getWorksheet('products')).toBeDefined();

      // usersテーブルの内容確認
      const usersSheet = workbook.getWorksheet('users');
      const idRow = usersSheet.getRow(2);
      expect(idRow.getCell(1).value).toBe('id');
      expect(idRow.getCell(2).value).toBe('bigint');
      expect(idRow.getCell(5).value).toBe('○'); // 主キー
    });

    test('should handle invalid DBML file', async () => {
      const nonExistentFile = path.join(TEST_DIR, 'nonexistent.dbml');
      const outputExcelFile = path.join(TEST_DIR, 'output.xlsx');

      await expect(
        convertDBMLToExcelFile(nonExistentFile, outputExcelFile)
      ).rejects.toThrow('Excel変換に失敗しました');
    });

    test('should create Excel file in same directory as input', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputExcelFile = path.join(TEST_DIR, 'test.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      await convertDBMLToExcelFile(testDbmlFile, outputExcelFile);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputExcelFile);

      expect(fs.existsSync(outputExcelFile)).toBe(true);
      expect(path.dirname(outputExcelFile)).toBe(path.dirname(testDbmlFile));
    });
  });
});
