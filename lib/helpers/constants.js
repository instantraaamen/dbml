"use strict";

/**
 * 共通定数とEnum定義
 */

// CSV関連の定数
const CSV_CONSTANTS = {
  DELIMITER: ',',
  QUOTE: '"',
  NEWLINE: '\n',
  DOUBLE_QUOTE: '""'
};

// テーブルCSVのヘッダー定義
const TABLE_CSV_HEADERS = ['フィールド名', 'データ型', 'NULL許可', 'デフォルト値', '主キー', 'ユニーク', '自動増分', '説明'];

// テーブル一覧CSVのヘッダー定義
const TABLE_LIST_CSV_HEADERS = ['テーブル名', '説明', 'フィールド数'];

// YES/NO値の定数
const BOOLEAN_VALUES = {
  YES: 'YES',
  NO: 'NO'
};

// NULL許可の値（逆論理）
const NULL_ALLOWED = {
  ALLOWED: 'YES',
  // NULL許可
  NOT_ALLOWED: 'NO' // NULL不許可
};

// ファイル名の定数
const FILE_NAMES = {
  TABLE_LIST: '_table_list.csv'
};

// デフォルトディレクトリ
const DEFAULT_OUTPUT_DIR = './excel';

// エラーメッセージ
const ERROR_MESSAGES = {
  FILE_NOT_FOUND: 'DBMLファイルが見つかりません',
  PARSE_FAILED: 'DBMLの解析に失敗しました',
  INVALID_TABLE: 'テーブル情報が無効です',
  INVALID_ARRAY: 'テーブル配列が無効です',
  INVALID_RELATIONS: 'リレーション配列が無効です'
};
module.exports = {
  CSV_CONSTANTS,
  TABLE_CSV_HEADERS,
  TABLE_LIST_CSV_HEADERS,
  BOOLEAN_VALUES,
  NULL_ALLOWED,
  FILE_NAMES,
  DEFAULT_OUTPUT_DIR,
  ERROR_MESSAGES
};