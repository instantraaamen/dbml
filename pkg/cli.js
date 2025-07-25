#!/usr/bin/env node

const { convertDBMLToExcel } = require('./dbmlToExcel');

// コマンドライン実行時の処理
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📊 DBML to Excel Converter

使用方法:
  npm run convert <dbmlファイル> [出力ディレクトリ]

例:
  npm run convert database_spec.dbml
  npm run convert database_spec.dbml ./output
`);
    process.exit(1);
  }
  
  const dbmlFile = args[0];
  const outputDir = args[1] || './excel';
  
  try {
    const result = convertDBMLToExcel(dbmlFile, outputDir);
    
    console.log(`✅ 変換完了!`);
    console.log(`📁 出力ディレクトリ: ${result.outputDir}`);
    console.log(`📋 ${result.tablesCount}個のテーブルを変換しました`);
    console.log(`💡 CSVファイルをExcelで開いてご利用ください`);
    
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };