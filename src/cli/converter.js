const path = require('path');
const { parseDBMLFile, normalizeDatabase } = require('../helpers/dbmlParser');
const { writeMultipleCSVFiles } = require('../helpers/fileWriter');
const CsvExporter = require('../export/CsvExporter');
const ExcelExporter = require('../export/ExcelExporter');

/**
 * 変換処理のメイン実装
 * @dbml/cliのconverterパターンに準拠
 */

/**
 * DBMLファイルを指定された形式に変換
 * @param {string} inputPath - 入力DBMLファイルパス
 * @param {string} outputPath - 出力パスまたはディレクトリ
 * @param {string} format - 出力形式 (csv, xlsx)
 * @param {Object} options - 変換オプション
 * @returns {Promise<Object>} 変換結果
 */
async function convertToFormat(inputPath, outputPath, format, options = {}) {
  // 入力ファイルの解析
  const database = parseDBMLFile(inputPath);
  const normalizedDb = normalizeDatabase(database);

  // 出力パスの決定
  const resolvedOutputPath = resolveOutputPath(inputPath, outputPath, format);

  // 形式別の変換処理
  switch (format.toLowerCase()) {
  case 'csv':
    return await convertToCSV(normalizedDb, resolvedOutputPath, options);

  case 'xlsx':
    return await convertToExcel(normalizedDb, resolvedOutputPath, options);

  default:
    throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * CSV形式への変換
 * @param {Object} database - 正規化されたデータベースオブジェクト
 * @param {string} outputPath - 出力パス
 * @param {Object} options - 変換オプション
 * @returns {Promise<Object>} 変換結果
 */
async function convertToCSV(database, outputPath, _options) {
  const exporter = new CsvExporter();
  const result = exporter.export(database);

  // 出力パスがディレクトリの場合は複数ファイル出力
  if (isDirectory(outputPath)) {
    writeMultipleCSVFiles(outputPath, result.files);

    return {
      format: result.format,
      outputDirectory: outputPath,
      files: Object.keys(result.files),
      tablesCount: result.tablesCount
    };
  } else {
    // 単一ファイル出力（テーブル一覧のみ）
    const overviewContent = result.files['tables_overview.csv'];
    const { writeCSVFile } = require('../helpers/fileWriter');
    writeCSVFile(outputPath, overviewContent);

    return {
      format: result.format,
      filePath: outputPath,
      tablesCount: result.tablesCount
    };
  }
}

/**
 * Excel形式への変換
 * @param {Object} database - 正規化されたデータベースオブジェクト
 * @param {string} outputPath - 出力ファイルパス
 * @param {Object} options - 変換オプション
 * @returns {Promise<Object>} 変換結果
 */
async function convertToExcel(database, outputPath, options) {
  const exporter = new ExcelExporter();
  const exportResult = await exporter.export(database, options);
  const saveResult = await exporter.saveToFile(outputPath);

  return {
    format: exportResult.format,
    filePath: saveResult.filePath,
    worksheets: exportResult.worksheets,
    tablesCount: exportResult.tablesCount
  };
}

/**
 * 出力パスを解決
 * @param {string} inputPath - 入力ファイルパス
 * @param {string} outputPath - 指定された出力パス
 * @param {string} format - 出力形式
 * @returns {string} 解決された出力パス
 */
function resolveOutputPath(inputPath, outputPath, format) {
  if (outputPath) {
    return outputPath;
  }

  // 出力パスが指定されていない場合、入力ファイルと同じディレクトリに出力
  const inputDir = path.dirname(inputPath);
  const inputName = path.basename(inputPath, path.extname(inputPath));

  if (format === 'csv') {
    return path.join(inputDir, `${inputName}_csv`);
  } else if (format === 'xlsx') {
    return path.join(inputDir, `${inputName}.xlsx`);
  }

  return inputDir;
}

/**
 * パスがディレクトリかどうかを判定
 * @param {string} filepath - ファイルパス
 * @returns {boolean} ディレクトリの場合true
 */
function isDirectory(filepath) {
  // 拡張子がない、または末尾が'/'の場合はディレクトリとみなす
  const ext = path.extname(filepath);
  return !ext || filepath.endsWith('/') || filepath.endsWith('\\');
}

module.exports = {
  convertToFormat,
  convertToCSV,
  convertToExcel,
  resolveOutputPath
};
