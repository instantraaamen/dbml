/**
 * DBML Converter Extensions - Main Entry Point
 * @dbml/cliのエクスポートパターンに準拠
 */

// CLI関数
const { dbmlConvert } = require('./cli');

// エクスポーター
const CsvExporter = require('./export/CsvExporter');
const ExcelExporter = require('./export/ExcelExporter');

// 変換関数
const { convertToFormat } = require('./cli/converter');

// ヘルパー関数
const {
  parseDBMLFile,
  parseDBMLContent,
  getTables
} = require('./helpers/dbmlParser');
const { writeCSVFile, writeMultipleCSVFiles } = require('./helpers/fileWriter');

// 後方互換性のための旧関数（非推奨）
const { convertDBMLToExcel } = require('../pkg/dbmlToExcel');
const { convertDBMLToExcelFile } = require('../pkg/excelConverter');

module.exports = {
  // CLI関数
  dbmlConvert,

  // メイン変換関数
  convertToFormat,

  // エクスポーター
  CsvExporter,
  ExcelExporter,

  // ヘルパー関数
  parseDBMLFile,
  parseDBMLContent,
  getTables,
  writeCSVFile,
  writeMultipleCSVFiles,

  // 後方互換性（非推奨）
  convertDBMLToExcel,
  convertDBMLToExcelFile
};
