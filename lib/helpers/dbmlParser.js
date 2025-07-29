"use strict";

const fs = require('fs');
const {
  Parser
} = require('@dbml/core');

/**
 * DBMLファイル解析用ヘルパー関数群
 * @dbml/cliのヘルパーパターンに準拠
 */

/**
 * DBMLコンテンツを解析してデータベースオブジェクトを返す
 * @param {string} content - DBMLコンテンツ
 * @returns {Object} 解析済みデータベースオブジェクト
 * @throws {Error} 解析に失敗した場合
 */
function parseDBMLContent(content) {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error('DBML content is empty or invalid');
  }
  try {
    const database = Parser.parse(content, 'dbml');
    return database;
  } catch (error) {
    throw new Error(`Failed to parse DBML content: ${error.message}`);
  }
}

/**
 * DBMLファイルを解析してデータベースオブジェクトを返す
 * @param {string} filePath - DBMLファイルパス
 * @returns {Object} 解析済みデータベースオブジェクト
 * @throws {Error} ファイル読み込みまたは解析に失敗した場合
 */
function parseDBMLFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`DBML file not found: ${filePath}`);
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parseDBMLContent(content);
  } catch (error) {
    if (error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to read or parse DBML file: ${error.message}`);
  }
}

/**
 * データベースオブジェクトからテーブル配列を取得
 * @param {Object} database - データベースオブジェクト
 * @returns {Array} テーブル配列
 */
function getTables(database) {
  if (!database || !database.schemas || !Array.isArray(database.schemas)) {
    return [];
  }

  // 最初のスキーマからテーブルを取得
  const firstSchema = database.schemas[0];
  if (!firstSchema || !firstSchema.tables) {
    return [];
  }
  return Array.isArray(firstSchema.tables) ? firstSchema.tables : [];
}

/**
 * データベースオブジェクトを正規化
 * @param {Object} database - データベースオブジェクト
 * @returns {Object} 正規化されたデータベースオブジェクト
 */
function normalizeDatabase(database) {
  const tables = getTables(database);
  return {
    tables: tables.map(table => ({
      ...table,
      fields: Array.isArray(table.fields) ? table.fields : []
    }))
  };
}
module.exports = {
  parseDBMLContent,
  parseDBMLFile,
  getTables,
  normalizeDatabase
};