const fs = require('fs');
const ExcelJS = require('exceljs');

/**
 * ExcelFormatter - DBML解析データをExcel形式で出力
 * 単一責任: Excel形式での出力とファイル生成
 */
class ExcelFormatter {
  constructor() {
    this.workbook = null;
  }

  /**
   * DBML解析データをExcelファイルに変換
   * @param {Object} dbmlData - 解析済みDBMLデータ
   * @param {string} outputPath - 出力ファイルパス
   * @returns {Promise<Object>} 変換結果
   */
  async formatToExcel(dbmlData, outputPath) {
    this._validateInputs(dbmlData, outputPath);

    // ワークブック作成
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'DBML to Excel Converter';
    this.workbook.created = new Date();

    // ワークシート作成
    const worksheets = [];

    // 1. テーブル一覧シート
    this._createOverviewWorksheet(dbmlData.tables);
    worksheets.push('テーブル一覧');

    // 2. 各テーブル用シート
    for (const table of dbmlData.tables) {
      this._createTableWorksheet(table);
      worksheets.push(table.name);
    }

    // ファイル保存（エラーハンドリング強化）
    try {
      await this.workbook.xlsx.writeFile(outputPath);
    } catch (error) {
      throw new Error(`Failed to write Excel file: ${error.message}`);
    }

    // ファイル作成完了の確実な確認（リトライ機能付き）
    await this._waitForFileCreation(outputPath);

    return {
      filePath: outputPath,
      tablesCount: dbmlData.tables.length,
      worksheets: worksheets
    };
  }

  /**
   * 入力値の検証
   * @private
   */
  _validateInputs(dbmlData, outputPath) {
    if (!dbmlData || !dbmlData.tables || !Array.isArray(dbmlData.tables)) {
      throw new Error('Invalid DBML data provided');
    }

    if (
      !outputPath ||
      typeof outputPath !== 'string' ||
      outputPath.trim() === ''
    ) {
      throw new Error('Invalid output path provided');
    }
  }

  /**
   * テーブル一覧ワークシートの作成
   * @private
   */
  _createOverviewWorksheet(tables) {
    const worksheet = this.workbook.addWorksheet('テーブル一覧');

    // ヘッダー設定
    const headers = ['テーブル名', '説明', 'フィールド数'];
    worksheet.addRow(headers);

    // ヘッダーのスタイリング（実際のカラム数のみ）
    this._styleHeaderRow(worksheet, 1, headers.length);

    // データ行の追加
    tables.forEach((table) => {
      worksheet.addRow([table.name, table.note || '', table.fields.length]);
    });

    // 列幅の自動調整
    this._autoAdjustColumnWidths(worksheet);

    // 罫線の追加（データ領域全体）
    this._addDataBorders(worksheet, tables.length + 1, headers.length);
  }

  /**
   * 個別テーブルワークシートの作成
   * @private
   */
  _createTableWorksheet(table) {
    const worksheet = this.workbook.addWorksheet(table.name);

    // ヘッダー設定
    const headers = [
      'フィールド名',
      'データ型',
      'NULL許可',
      'デフォルト値',
      '主キー',
      'ユニーク',
      '自動増分',
      '説明'
    ];
    worksheet.addRow(headers);

    // ヘッダーのスタイリング（実際のカラム数のみ）
    this._styleHeaderRow(worksheet, 1, headers.length);

    // フィールドデータの追加
    table.fields.forEach((field) => {
      // typeがオブジェクトの場合は文字列表現を使用
      const typeDisplay =
        typeof field.type === 'object' && field.type.type_name
          ? field.type.type_name
          : field.type;

      worksheet.addRow([
        field.name,
        typeDisplay,
        field.not_null ? '×' : '○',
        field.default || '',
        field.pk ? '○' : '',
        field.unique ? '○' : '',
        field.increment ? '○' : '',
        field.note || ''
      ]);
    });

    // 列幅の自動調整
    this._autoAdjustColumnWidths(worksheet);

    // 罫線の追加（データ領域全体）
    this._addDataBorders(worksheet, table.fields.length + 1, headers.length);
  }

  /**
   * 列幅の自動調整
   * @private
   */
  _autoAdjustColumnWidths(worksheet) {
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.max(maxLength + 2, 12);
    });
  }

  /**
   * ヘッダー行のスタイリング（指定した列数のみ）
   * @private
   */
  _styleHeaderRow(worksheet, rowNumber, columnCount) {
    const headerRow = worksheet.getRow(rowNumber);

    for (let col = 1; col <= columnCount; col++) {
      const cell = headerRow.getCell(col);
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
  }

  /**
   * データ領域への罫線追加（実際のデータ範囲のみ）
   * @private
   */
  _addDataBorders(worksheet, rowCount, columnCount) {
    // 実際のデータ範囲に対してのみ罫線を適用
    for (let row = 1; row <= rowCount; row++) {
      for (let col = 1; col <= columnCount; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    }
  }

  /**
   * ファイル作成完了の確実な待機（リトライ機能付き）
   * @private
   */
  async _waitForFileCreation(outputPath) {
    // CI環境の検出とそれに応じた設定調整
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    const maxRetries = isCI ? 40 : 20;
    const baseDelay = isCI ? 50 : 25;
    const maxDelay = isCI ? 500 : 250;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // ファイル存在確認
      if (fs.existsSync(outputPath)) {
        try {
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            // ファイルが存在し、サイズも0より大きい
            return;
          }
        } catch (error) {
          // statSync失敗は無視して再試行
        }
      }

      // 指数的バックオフで待機（CI環境では最大500ms）
      const delay = Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // 最終確認
    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `Excel file was not created after ${maxRetries} attempts: ${outputPath} (CI: ${isCI})`
      );
    }

    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      throw new Error(`Excel file was created but is empty: ${outputPath}`);
    }
  }
}

module.exports = { ExcelFormatter };
