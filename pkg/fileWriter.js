/**
 * ファイル出力機能
 * 責任: ファイルシステムへの書き込み処理
 */

const fs = require('fs');
const path = require('path');

/**
 * ディレクトリが存在しない場合は作成
 * @param {string} dirPath - ディレクトリパス
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * CSVファイルを書き込み
 * @param {string} filePath - ファイルパス
 * @param {string} csvContent - CSV内容
 */
function writeCSVFile(filePath, csvContent) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, csvContent, 'utf8');
}

/**
 * 複数のCSVファイルを指定ディレクトリに書き込み
 * @param {string} outputDir - 出力ディレクトリ
 * @param {Object} csvFiles - ファイル名とCSV内容のマッピング
 * @returns {Array} 作成されたファイル名の配列
 */
function writeMultipleCSVFiles(outputDir, csvFiles) {
  ensureDirectoryExists(outputDir);

  const createdFiles = [];

  Object.entries(csvFiles).forEach(([fileName, csvContent]) => {
    const filePath = path.join(outputDir, fileName);
    writeCSVFile(filePath, csvContent);
    createdFiles.push(fileName);
  });

  return createdFiles;
}

/**
 * テーブルCSVファイル群を作成
 * @param {string} outputDir - 出力ディレクトリ
 * @param {Array} tables - テーブル配列
 * @param {Function} tableToCSVConverter - テーブルをCSVに変換する関数
 * @returns {Array} 作成されたファイル名の配列
 */
function writeTableCSVFiles(outputDir, tables, tableToCSVConverter) {
  ensureDirectoryExists(outputDir);

  const createdFiles = [];

  tables.forEach((table) => {
    const csvContent = tableToCSVConverter(table);
    const fileName = `${table.name}.csv`;
    const filePath = path.join(outputDir, fileName);

    writeCSVFile(filePath, csvContent);
    createdFiles.push(fileName);
  });

  return createdFiles;
}

module.exports = {
  ensureDirectoryExists,
  writeCSVFile,
  writeMultipleCSVFiles,
  writeTableCSVFiles
};
