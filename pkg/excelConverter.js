const { parseDBMLFile, getTables } = require('./dbmlParser');
const { ExcelFormatter } = require('./excelFormatter');

/**
 * DBML to Excel変換の統合モジュール
 * 既存のCSV変換機能と並行してExcel出力機能を提供
 */

/**
 * DBMLファイルをExcelファイルに変換
 * @param {string} dbmlFilePath - DBMLファイルのパス  
 * @param {string} outputPath - 出力Excelファイルのパス
 * @returns {Promise<Object>} 変換結果
 */
async function convertDBMLToExcelFile(dbmlFilePath, outputPath) {
  try {
    // 1. DBML解析
    const schema = parseDBMLFile(dbmlFilePath);
    const tables = getTables(schema);
    const dbmlData = { tables };
    
    // 2. Excel形式で出力
    const formatter = new ExcelFormatter();
    const result = await formatter.formatToExcel(dbmlData, outputPath);
    
    return result;
  } catch (error) {
    throw new Error(`Excel変換に失敗しました: ${error.message}`);
  }
}

module.exports = {
  convertDBMLToExcelFile
};