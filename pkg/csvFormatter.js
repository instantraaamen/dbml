/**
 * CSVフォーマット機能
 * 責任: テーブルデータのCSV形式への変換
 */

const { dataToCSV } = require('./csvUtils');
const { 
  TABLE_CSV_HEADERS, 
  TABLE_LIST_CSV_HEADERS, 
  BOOLEAN_VALUES, 
  NULL_ALLOWED 
} = require('./constants');

/**
 * フィールドのデータ型を文字列として取得
 * @param {Object} field - フィールドオブジェクト
 * @returns {string} データ型文字列
 */
function getFieldDataType(field) {
  const typeName = field.type.type_name;
  const args = field.type.args;
  
  if (args && Array.isArray(args) && args.length > 0) {
    return `${typeName}(${args.join(',')})`;
  }
  
  return typeName;
}

/**
 * フィールドをCSV行データに変換
 * @param {Object} field - フィールドオブジェクト
 * @returns {Array} CSV行データ
 */
function fieldToRowData(field) {
  return [
    field.name,
    getFieldDataType(field),
    field.not_null ? NULL_ALLOWED.NOT_ALLOWED : NULL_ALLOWED.ALLOWED,
    field.default_value ? field.default_value.value : '',
    field.pk ? BOOLEAN_VALUES.YES : BOOLEAN_VALUES.NO,
    field.unique ? BOOLEAN_VALUES.YES : BOOLEAN_VALUES.NO,
    field.increment ? BOOLEAN_VALUES.YES : BOOLEAN_VALUES.NO,
    field.note ? field.note.replace(/'/g, '') : ''
  ];
}

/**
 * テーブル情報をCSV形式に変換
 * @param {Object} table - テーブルオブジェクト
 * @returns {string} CSV形式の文字列
 */
function convertTableToCSV(table) {
  const rows = [TABLE_CSV_HEADERS];
  
  // フィールドデータを追加
  table.fields.forEach(field => {
    rows.push(fieldToRowData(field));
  });
  
  return dataToCSV(rows);
}

/**
 * テーブル一覧をCSV形式に変換
 * @param {Array} tables - テーブル配列
 * @returns {string} CSV形式の文字列
 */
function convertTableListToCSV(tables) {
  const rows = [TABLE_LIST_CSV_HEADERS];
  
  tables.forEach(table => {
    const note = table.note ? table.note.replace(/'/g, '') : '';
    rows.push([
      table.name,
      note,
      table.fields.length
    ]);
  });
  
  return dataToCSV(rows);
}

module.exports = {
  getFieldDataType,
  fieldToRowData,
  convertTableToCSV,
  convertTableListToCSV
};