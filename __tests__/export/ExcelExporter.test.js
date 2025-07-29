const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const ExcelExporter = require('../../src/export/ExcelExporter');
const { createUniqueTestDir, cleanupTestDir, waitForFileReady } = require('../../test/helpers/testUtils');

// テスト用の一時ディレクトリ（各テストで独立）
let TEST_DIR;

// テストユーティリティからwaitForFileReadyを使用

describe('ExcelExporter', () => {
  let exporter;

  beforeEach(() => {
    exporter = new ExcelExporter();
    // 各テストで独立したディレクトリを作成
    TEST_DIR = createUniqueTestDir('excelExporter');
  });

  afterEach(async () => {
    // テスト用ディレクトリをクリーンアップ
    if (TEST_DIR) {
      await cleanupTestDir(TEST_DIR);
    }
  });

  describe('constructor', () => {
    test('should create ExcelExporter instance with correct format', () => {
      expect(exporter).toBeInstanceOf(ExcelExporter);
      expect(exporter.format).toBe('xlsx');
      expect(exporter.workbook).toBeNull();
    });
  });

  describe('export', () => {
    const mockDatabase = {
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
            }
          ]
        }
      ]
    };

    test('should export database to Excel format', async () => {
      const result = await exporter.export(mockDatabase);

      expect(result).toEqual({
        format: 'xlsx',
        workbook: expect.any(ExcelJS.Workbook),
        worksheets: ['テーブル一覧', 'users', 'products'],
        tablesCount: 2
      });

      expect(exporter.workbook).toBeInstanceOf(ExcelJS.Workbook);
    });

    test('should create correct worksheets', async () => {
      await exporter.export(mockDatabase);

      const overviewSheet = exporter.workbook.getWorksheet('テーブル一覧');
      const usersSheet = exporter.workbook.getWorksheet('users');
      const productsSheet = exporter.workbook.getWorksheet('products');

      expect(overviewSheet).toBeDefined();
      expect(usersSheet).toBeDefined();
      expect(productsSheet).toBeDefined();
    });

    test('should throw error for invalid database structure', async () => {
      await expect(exporter.export({})).rejects.toThrow(
        'Invalid database structure: tables array required'
      );
      await expect(exporter.export({ tables: null })).rejects.toThrow(
        'Invalid database structure: tables array required'
      );
    });

    test('should handle empty tables array', async () => {
      const emptyDatabase = { tables: [] };
      const result = await exporter.export(emptyDatabase);

      expect(result.tablesCount).toBe(0);
      expect(result.worksheets).toEqual(['テーブル一覧']);
    });
  });

  describe('saveToFile', () => {
    const mockDatabase = {
      tables: [
        {
          name: 'test_table',
          note: 'テストテーブル',
          fields: [
            {
              name: 'id',
              type: 'bigint',
              pk: true,
              increment: true,
              note: 'ID'
            }
          ]
        }
      ]
    };

    test('should save Excel file to specified path', async () => {
      const outputPath = path.join(TEST_DIR, 'test.xlsx');

      await exporter.export(mockDatabase);
      const result = await exporter.saveToFile(outputPath);

      expect(result).toEqual({
        filePath: outputPath,
        format: 'xlsx'
      });

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    test('should create output directory if it does not exist', async () => {
      const outputPath = path.join(TEST_DIR, 'subdir', 'test.xlsx');

      await exporter.export(mockDatabase);
      await exporter.saveToFile(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      expect(fs.existsSync(path.dirname(outputPath))).toBe(true);
    });

    test('should throw error if no workbook exists', async () => {
      const outputPath = path.join(TEST_DIR, 'test.xlsx');

      await expect(exporter.saveToFile(outputPath)).rejects.toThrow(
        'No workbook to save. Call export() first.'
      );
    });

    test('should create valid Excel file with correct content', async () => {
      const outputPath = path.join(TEST_DIR, 'test.xlsx');

      await exporter.export(mockDatabase);
      await exporter.saveToFile(outputPath);

      // ファイル作成完了の確実な確認
      await waitForFileReady(outputPath);

      // 生成されたExcelファイルを読み込んで検証
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(outputPath);

      const overviewSheet = workbook.getWorksheet('テーブル一覧');
      expect(overviewSheet).toBeDefined();

      // ヘッダー行の確認
      const headerRow = overviewSheet.getRow(1);
      expect(headerRow.getCell(1).value).toBe('テーブル名');
      expect(headerRow.getCell(2).value).toBe('説明');
      expect(headerRow.getCell(3).value).toBe('フィールド数');

      // データ行の確認
      const dataRow = overviewSheet.getRow(2);
      expect(dataRow.getCell(1).value).toBe('test_table');
      expect(dataRow.getCell(2).value).toBe('テストテーブル');
      expect(dataRow.getCell(3).value).toBe(1);
    });
  });
});
