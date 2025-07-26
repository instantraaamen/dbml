const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { ExcelFormatter } = require('../pkg/excelFormatter');

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(__dirname, 'temp');
const TEST_OUTPUT_DIR = path.join(TEST_DIR, 'output');

// ファイル作成完了待機のヘルパー関数
async function waitForFileReady(filePath) {
  const maxRetries = 15;
  const baseDelay = 20;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          return;
        }
      } catch (error) {
        // statSync失敗は無視して再試行
      }
    }
    
    const delay = Math.min(baseDelay * Math.pow(1.4, attempt), 200);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  
  throw new Error(`File not ready after ${maxRetries} attempts: ${filePath}`);
}

// テスト用のDBMLデータ
const TEST_DBML_DATA = {
  tables: [
    {
      name: 'users',
      note: 'ユーザー情報テーブル',
      fields: [
        {
          name: 'id',
          type: 'bigint',
          pk: true,
          increment: true,
          note: 'ユーザーID'
        },
        {
          name: 'name',
          type: 'varchar(100)',
          not_null: true,
          note: 'ユーザー名'
        },
        {
          name: 'email',
          type: 'varchar(255)',
          not_null: true,
          unique: true,
          note: 'メールアドレス'
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          note: '作成日時'
        }
      ]
    },
    {
      name: 'products',
      note: '商品情報テーブル',
      fields: [
        {
          name: 'id',
          type: 'bigint',
          pk: true,
          increment: true,
          note: '商品ID'
        },
        {
          name: 'name',
          type: 'varchar(200)',
          not_null: true,
          note: '商品名'
        },
        {
          name: 'price',
          type: 'decimal(10,2)',
          not_null: true,
          note: '価格'
        }
      ]
    }
  ]
};

describe('ExcelFormatter', () => {
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

  describe('constructor', () => {
    test('should create ExcelFormatter instance', () => {
      const formatter = new ExcelFormatter();
      expect(formatter).toBeInstanceOf(ExcelFormatter);
    });
  });

  describe('formatToExcel', () => {
    test('should create Excel file with correct structure', async () => {
      const formatter = new ExcelFormatter();
      const outputPath = path.join(TEST_OUTPUT_DIR, 'test.xlsx');

      const result = await formatter.formatToExcel(TEST_DBML_DATA, outputPath);

      expect(result).toEqual({
        filePath: outputPath,
        tablesCount: 2,
        worksheets: ['テーブル一覧', 'users', 'products']
      });

      // ファイルが作成されていることを確認
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    test('should create output directory if it does not exist', async () => {
      const formatter = new ExcelFormatter();
      const nonExistentDir = path.join(TEST_DIR, 'new_output');
      const outputPath = path.join(nonExistentDir, 'test.xlsx');

      await formatter.formatToExcel(TEST_DBML_DATA, outputPath);

      expect(fs.existsSync(nonExistentDir)).toBe(true);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    test('should create overview worksheet with table summary', async () => {
      const formatter = new ExcelFormatter();
      const outputPath = path.join(TEST_OUTPUT_DIR, 'test.xlsx');

      await formatter.formatToExcel(TEST_DBML_DATA, outputPath);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputPath);

      // Excelファイルを読み込んで内容を確認（エラーハンドリング強化）
      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.readFile(outputPath);
      } catch (error) {
        throw new Error(
          `Failed to read Excel file in test: ${error.message}. File exists: ${fs.existsSync(outputPath)}`
        );
      }

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

    test('should create individual worksheets for each table', async () => {
      const formatter = new ExcelFormatter();
      const outputPath = path.join(TEST_OUTPUT_DIR, 'test.xlsx');

      await formatter.formatToExcel(TEST_DBML_DATA, outputPath);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputPath);

      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.readFile(outputPath);
      } catch (error) {
        throw new Error(
          `Failed to read Excel file in test: ${error.message}. File exists: ${fs.existsSync(outputPath)}`
        );
      }

      // usersテーブルのワークシート確認
      const usersSheet = workbook.getWorksheet('users');
      expect(usersSheet).toBeDefined();

      const headerRow = usersSheet.getRow(1);
      expect(headerRow.getCell(1).value).toBe('フィールド名');
      expect(headerRow.getCell(2).value).toBe('データ型');
      expect(headerRow.getCell(3).value).toBe('NULL許可');

      // フィールドデータの確認
      const idRow = usersSheet.getRow(2);
      expect(idRow.getCell(1).value).toBe('id');
      expect(idRow.getCell(2).value).toBe('bigint');
      expect(idRow.getCell(5).value).toBe('○'); // 主キー
    });

    test('should apply proper styling to headers', async () => {
      const formatter = new ExcelFormatter();
      const outputPath = path.join(TEST_OUTPUT_DIR, 'test.xlsx');

      await formatter.formatToExcel(TEST_DBML_DATA, outputPath);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputPath);

      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.readFile(outputPath);
      } catch (error) {
        throw new Error(
          `Failed to read Excel file in test: ${error.message}. File exists: ${fs.existsSync(outputPath)}`
        );
      }

      const usersSheet = workbook.getWorksheet('users');
      const headerRow = usersSheet.getRow(1);

      // ヘッダーのスタイルを確認
      const headerCell = headerRow.getCell(1);
      expect(headerCell.font.bold).toBe(true);
      expect(headerCell.fill.type).toBe('pattern');
    });

    test('should auto-adjust column widths', async () => {
      const formatter = new ExcelFormatter();
      const outputPath = path.join(TEST_OUTPUT_DIR, 'test.xlsx');

      await formatter.formatToExcel(TEST_DBML_DATA, outputPath);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputPath);

      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.readFile(outputPath);
      } catch (error) {
        throw new Error(
          `Failed to read Excel file in test: ${error.message}. File exists: ${fs.existsSync(outputPath)}`
        );
      }

      const usersSheet = workbook.getWorksheet('users');

      // 列幅が調整されていることを確認
      usersSheet.columns.forEach((column) => {
        expect(column.width).toBeGreaterThan(10);
      });
    });
  });

  describe('error handling', () => {
    test('should throw error for invalid data', async () => {
      const formatter = new ExcelFormatter();
      const outputPath = path.join(TEST_OUTPUT_DIR, 'test.xlsx');

      await expect(formatter.formatToExcel(null, outputPath)).rejects.toThrow(
        'Invalid DBML data provided'
      );
    });

    test('should throw error for invalid output path', async () => {
      const formatter = new ExcelFormatter();

      await expect(formatter.formatToExcel(TEST_DBML_DATA, '')).rejects.toThrow(
        'Invalid output path provided'
      );
    });
  });
});
