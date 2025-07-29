const fs = require('fs');
const path = require('path');
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
    // CI環境の検出（スコープを広げる）
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

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

      // より信頼性の高いExcel書き込み処理（CI環境対応）
      
      if (isCI) {
        // CI環境: バッファ経由で書き込み（より確実）
        const buffer = await this.workbook.xlsx.writeBuffer();
        fs.writeFileSync(outputPath, buffer);
        
        // 書き込み確認とfsync
        await new Promise((resolve) => setTimeout(resolve, 300));
        try {
          const fd = fs.openSync(outputPath, 'r+');
          fs.fsyncSync(fd);
          fs.closeSync(fd);
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (syncError) {
          // fsync失敗時は警告のみ
          console.warn('fsync failed, continuing:', syncError.message);
        }
      } else {
        // ローカル環境: 通常の書き込み
        await this.workbook.xlsx.writeFile(outputPath);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      throw new Error(`Failed to write Excel file: ${error.message}`);
    }

    // ファイル作成完了の確実な確認（リトライ機能付き）
    // 書き込み直後は少し待機してから確認開始
    await new Promise((resolve) => setTimeout(resolve, isCI ? 500 : 100));
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
    // CI環境の検出
    const isCI =
      process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

    // 段階的な待機戦略（ローカル環境でも十分なリトライ）
    const maxRetries = isCI ? 50 : 30;
    const baseDelay = isCI ? 200 : 50;
    const maxDelay = isCI ? 1000 : 300;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // ファイル存在確認（CI環境ではより厳密）
      if (fs.existsSync(outputPath)) {
        try {
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            // CI環境では追加の読み込み可能性チェック
            if (isCI) {
              try {
                fs.readFileSync(outputPath, { flag: 'r' });
                return; // 読み込み成功
              } catch (readError) {
                // 読み込み失敗時は継続
              }
            } else {
              return; // ローカル環境では存在とサイズのみチェック
            }
          }
        } catch (error) {
          // statSync失敗は無視して再試行
        }
      }

      // 段階的バックオフ待機
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
