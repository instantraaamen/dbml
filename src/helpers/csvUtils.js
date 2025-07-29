/**
 * CSV関連のユーティリティ関数
 * 責任: CSV形式でのデータエスケープとフォーマット
 */

const { CSV_CONSTANTS } = require('./constants');

/**
 * CSVエスケープ処理
 * @param {any} value - エスケープする値
 * @returns {string} エスケープされた文字列
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (
    str.includes(CSV_CONSTANTS.DELIMITER) ||
    str.includes(CSV_CONSTANTS.QUOTE) ||
    str.includes(CSV_CONSTANTS.NEWLINE)
  ) {
    return `${CSV_CONSTANTS.QUOTE}${str.replace(/"/g, CSV_CONSTANTS.DOUBLE_QUOTE)}${CSV_CONSTANTS.QUOTE}`;
  }
  return str;
}

/**
 * 配列をCSV行に変換
 * @param {Array} array - CSV行にする配列
 * @returns {string} CSV形式の行
 */
function arrayToCSVRow(array) {
  return array.map(escapeCSV).join(CSV_CONSTANTS.DELIMITER);
}

/**
 * 2次元配列をCSV文字列に変換
 * @param {Array<Array>} data - 2次元配列
 * @returns {string} CSV文字列
 */
function dataToCSV(data) {
  return data.map((row) => arrayToCSVRow(row)).join(CSV_CONSTANTS.NEWLINE);
}

module.exports = {
  escapeCSV,
  arrayToCSVRow,
  dataToCSV
};
