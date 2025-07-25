/**
 * DBML to Excel メインコンバーター
 * 責任: 変換処理全体のオーケストレーション
 */

const { parseDBMLFile, getTables } = require('./dbmlParser');
const { convertTableToCSV, convertTableListToCSV } = require('./csvFormatter');
const { writeTableCSVFiles, writeCSVFile } = require('./fileWriter');
const { DEFAULT_OUTPUT_DIR, FILE_NAMES } = require('./constants');
const path = require('path');

/**
 * DBMLファイルをExcel用CSVファイル群に変換
 * @param {string} dbmlFile - DBMLファイルのパス
 * @param {string} outputDir - 出力ディレクトリ
 * @returns {Object} 変換結果の詳細情報
 */
function convertDBMLToExcel(dbmlFile, outputDir = DEFAULT_OUTPUT_DIR) {
  // 1. DBMLファイルを解析
  const schema = parseDBMLFile(dbmlFile);
  const tables = getTables(schema);
  
  // 2. 各テーブルのCSVファイルを作成
  const createdFiles = writeTableCSVFiles(outputDir, tables, convertTableToCSV);
  
  // 3. テーブル一覧CSVを作成
  const tableListCSV = convertTableListToCSV(tables);
  const listFilePath = path.join(outputDir, FILE_NAMES.TABLE_LIST);
  writeCSVFile(listFilePath, tableListCSV);
  
  // 4. 結果を返す
  return {
    tablesCount: tables.length,
    files: createdFiles,
    outputDir: outputDir
  };
}

module.exports = {
  convertDBMLToExcel
};