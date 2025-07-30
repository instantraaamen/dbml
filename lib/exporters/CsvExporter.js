"use strict";

const {
  dataToCSV
} = require('../helpers/csvUtils');

/**
 * CSV形式でのエクスポート機能を提供するクラス
 * @dbml/cliのExporterパターンに準拠
 */
class CsvExporter {
  constructor() {
    this.format = 'csv';
  }

  /**
   * DBMLデータをCSV形式で出力
   * @param {Object} database - DBMLデータベースオブジェクト
   * @param {Object} options - エクスポートオプション
   * @returns {Object} エクスポート結果
   */
  export(database) {
    const {
      tables
    } = database;
    if (!tables || !Array.isArray(tables)) {
      throw new Error('Invalid database structure: tables array required');
    }
    const results = {};

    // テーブル一覧CSVを生成
    results['tables_overview.csv'] = this._generateTablesOverview(tables);

    // 各テーブルのCSVを生成
    tables.forEach(table => {
      results[`${table.name}.csv`] = this._generateTableCsv(table);
    });
    return {
      format: this.format,
      files: results,
      tablesCount: tables.length
    };
  }

  /**
   * テーブル一覧のCSVを生成
   * @param {Array} tables - テーブル配列
   * @returns {string} CSV文字列
   * @private
   */
  _generateTablesOverview(tables) {
    const headers = ['テーブル名', '説明', 'フィールド数'];
    const data = [headers, ...tables.map(table => [table.name, table.note || '', table.fields ? table.fields.length : 0])];
    return dataToCSV(data);
  }

  /**
   * 個別テーブルのCSVを生成
   * @param {Object} table - テーブルオブジェクト
   * @returns {string} CSV文字列
   * @private
   */
  _generateTableCsv(table) {
    const headers = ['フィールド名', 'データ型', 'NULL許可', 'デフォルト値', '主キー', 'ユニーク', '自動増分', '説明'];
    const data = [headers, ...table.fields.map(field => this._fieldToRowData(field))];
    return dataToCSV(data);
  }

  /**
   * フィールドオブジェクトをCSV行データに変換
   * @param {Object} field - フィールドオブジェクト
   * @returns {Array} CSV行データ
   * @private
   */
  _fieldToRowData(field) {
    const dataType = this._getFieldDataType(field.type);
    return [field.name, dataType, field.not_null ? '×' : '○', field.default || '', field.pk ? '○' : '', field.unique ? '○' : '', field.increment ? '○' : '', field.note || ''];
  }

  /**
   * フィールドタイプから表示用データ型を取得
   * @param {string|Object} type - フィールドタイプ
   * @returns {string} データ型文字列
   * @private
   */
  _getFieldDataType(type) {
    if (typeof type === 'string') {
      return type;
    }
    if (typeof type === 'object' && type.type_name) {
      if (type.args && Array.isArray(type.args) && type.args.length > 0) {
        return `${type.type_name}(${type.args.join(', ')})`;
      }
      return type.type_name;
    }
    return 'unknown';
  }
}
module.exports = CsvExporter;