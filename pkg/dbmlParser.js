/**
 * DBML解析機能
 * 責任: DBMLファイルの読み込みと解析
 */

const { Parser } = require('@dbml/core');
const fs = require('fs');
const { ERROR_MESSAGES } = require('./constants');

/**
 * DBMLファイルを読み込んで解析
 * @param {string} filePath - DBMLファイルのパス
 * @returns {Object} 解析されたスキーマ
 * @throws {Error} ファイルが見つからない、または解析に失敗した場合
 */
function parseDBMLFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${ERROR_MESSAGES.FILE_NOT_FOUND}: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return parseDBMLContent(content);
}

/**
 * DBML文字列を解析
 * @param {string} content - DBML文字列
 * @returns {Object} 解析されたスキーマ
 * @throws {Error} 解析に失敗した場合
 */
function parseDBMLContent(content) {
  const database = Parser.parse(content, 'dbml');

  if (!database || !database.schemas || !database.schemas[0]) {
    throw new Error(ERROR_MESSAGES.PARSE_FAILED);
  }

  return database.schemas[0];
}

/**
 * スキーマからテーブル一覧を取得
 * @param {Object} schema - 解析されたスキーマ
 * @returns {Array} テーブル配列
 */
function getTables(schema) {
  return schema.tables || [];
}

module.exports = {
  parseDBMLFile,
  parseDBMLContent,
  getTables
};
