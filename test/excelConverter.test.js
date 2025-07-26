const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { convertDBMLToExcelFile } = require('../pkg/excelConverter');

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(__dirname, 'temp');

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

  describe('convertDBMLToExcelFile', () => {
    test('should convert DBML file to Excel file', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputExcelFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const result = await convertDBMLToExcelFile(
        testDbmlFile,
        outputExcelFile
      );

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

      // Windows環境でのファイルアクセス安定化のための待機
      if (process.platform === 'win32') {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 生成されたExcelファイルを読み込んで検証
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(outputExcelFile);

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

    test('should create output directory if it does not exist', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputDir = path.join(TEST_DIR, 'new_dir');
      const outputExcelFile = path.join(outputDir, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      await convertDBMLToExcelFile(testDbmlFile, outputExcelFile);

      expect(fs.existsSync(outputDir)).toBe(true);
      expect(fs.existsSync(outputExcelFile)).toBe(true);
    });
  });
});
