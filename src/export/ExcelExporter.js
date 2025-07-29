const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

/**
 * Excel形式でのエクスポート機能を提供するクラス
 * @dbml/cliのExporterパターンに準拠
 */
class ExcelExporter {
  constructor() {
    this.format = 'xlsx';
    this.workbook = null;
  }

  /**
   * DBMLデータをExcel形式で出力
   * @param {Object} database - DBMLデータベースオブジェクト
   * @param {Object} options - エクスポートオプション
   * @returns {Object} エクスポート結果
   */
  async export(database) {
    const { tables } = database;

    if (!tables || !Array.isArray(tables)) {
      throw new Error('Invalid database structure: tables array required');
    }

    // ワークブック作成
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'DBML Converter Extensions';
    this.workbook.created = new Date();

    const worksheets = [];

    // 1. テーブル一覧シート
    this._createOverviewWorksheet(tables);
    worksheets.push('テーブル一覧');

    // 2. 各テーブル用シート
    for (const table of tables) {
      this._createTableWorksheet(table);
      worksheets.push(table.name);
    }

    return {
      format: this.format,
      workbook: this.workbook,
      worksheets: worksheets,
      tablesCount: tables.length
    };
  }

  /**
   * ファイルに保存
   * @param {string} outputPath - 出力ファイルパス
   * @returns {Promise<Object>} 保存結果
   */
  async saveToFile(outputPath) {
    if (!this.workbook) {
      throw new Error('No workbook to save. Call export() first.');
    }

    try {
      // 出力ディレクトリの存在確認と作成（CI環境での競合状態を考慮）
      const outputDir = path.dirname(outputPath);
      try {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
      } catch (mkdirError) {
        // 他のプロセスが同時にディレクトリを作成した場合を考慮
        if (mkdirError.code !== 'EEXIST' && !fs.existsSync(outputDir)) {
          throw mkdirError;
        }
      }

      await this.workbook.xlsx.writeFile(outputPath);
      
      // ファイル書き込み完了を確実にするため短時間待機
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // CI環境での書き込み完了を確実にするため、ファイルハンドルを同期
      if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
        try {
          const fd = fs.openSync(outputPath, 'r+');
          fs.fsyncSync(fd);
          fs.closeSync(fd);
        } catch (syncError) {
          // fsync失敗は無視（ファイルが存在しない場合など）
        }
      }

      // ファイル作成完了の確実な確認
      await this._waitForFileCreation(outputPath);

      return {
        filePath: outputPath,
        format: this.format
      };
    } catch (error) {
      throw new Error(`Failed to write Excel file: ${error.message}`);
    }
  }

  /**
   * テーブル一覧ワークシートの作成
   * @param {Array} tables - テーブル配列
   * @private
   */
  _createOverviewWorksheet(tables) {
    const worksheet = this.workbook.addWorksheet('テーブル一覧');

    // ヘッダー設定
    const headers = ['テーブル名', '説明', 'フィールド数'];
    worksheet.addRow(headers);

    // ヘッダーのスタイリング
    this._styleHeaderRow(worksheet, 1, headers.length);

    // データ行の追加
    tables.forEach((table) => {
      worksheet.addRow([table.name, table.note || '', table.fields.length]);
    });

    // 列幅の自動調整
    this._autoAdjustColumnWidths(worksheet);

    // 罫線の追加
    this._addDataBorders(worksheet, tables.length + 1, headers.length);
  }

  /**
   * 個別テーブルワークシートの作成
   * @param {Object} table - テーブルオブジェクト
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

    // ヘッダーのスタイリング
    this._styleHeaderRow(worksheet, 1, headers.length);

    // フィールドデータの追加
    table.fields.forEach((field) => {
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

    // 罫線の追加
    this._addDataBorders(worksheet, table.fields.length + 1, headers.length);
  }

  /**
   * 列幅の自動調整
   * @param {Object} worksheet - ワークシート
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
   * ヘッダー行のスタイリング
   * @param {Object} worksheet - ワークシート
   * @param {number} rowNumber - 行番号
   * @param {number} columnCount - 列数
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
   * データ領域への罫線追加
   * @param {Object} worksheet - ワークシート
   * @param {number} rowCount - 行数
   * @param {number} columnCount - 列数
   * @private
   */
  _addDataBorders(worksheet, rowCount, columnCount) {
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
   * ファイル作成完了の確実な待機
   * @param {string} outputPath - 出力ファイルパス
   * @private
   */
  async _waitForFileCreation(outputPath) {
    const isCI =
      process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    const maxRetries = isCI ? 60 : 15;
    const baseDelay = isCI ? 30 : 20;
    const maxDelay = isCI ? 200 : 100;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (fs.existsSync(outputPath)) {
        try {
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            return;
          }
        } catch (error) {
          // statSync失敗は無視して再試行
        }
      }

      const delay = Math.min(baseDelay * Math.pow(1.3, attempt), maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

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

module.exports = ExcelExporter;
