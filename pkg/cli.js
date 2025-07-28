#!/usr/bin/env node

const { convertDBMLToExcel } = require('./dbmlToExcel');
const { convertDBMLToExcelFile } = require('./excelConverter');

// コマンドライン実行時の処理
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📊 DBML Converter Extensions

Enhanced DBML conversion utilities with Excel/CSV export capabilities.

使用方法:
  dbml-convert <dbmlファイル> [出力パス] [オプション]

オプション:
  --format <csv|xlsx>     出力形式 (デフォルト: csv)

例:
  dbml-convert database_spec.dbml                           # CSV出力 (デフォルト)
  dbml-convert database_spec.dbml --format xlsx             # Excel出力
  dbml-convert database_spec.dbml ./output --format csv     # 指定ディレクトリにCSV
  dbml-convert database_spec.dbml report.xlsx --format xlsx # 指定ファイルにExcel

標準DBML変換 (@dbml/cliも併用推奨):
  dbml2sql database_spec.dbml --postgres > schema.sql      # PostgreSQL DDL
  dbml2sql database_spec.dbml --mysql > schema.sql         # MySQL DDL
  dbml2docs database_spec.dbml --format md > docs.md       # ドキュメント
`);
    process.exit(1);
  }

  // 引数の解析
  const options = parseArguments(args);

  try {
    let result;

    if (options.format === 'xlsx') {
      result = await convertDBMLToExcelFile(
        options.inputFile,
        options.outputPath
      );
      console.log('✅ Excel変換完了!');
      console.log(`📄 出力ファイル: ${result.filePath}`);
      console.log(
        `📋 ${result.tablesCount}個のテーブルを${result.worksheets.length}シートに変換`
      );
      console.log('💡 Excelファイルを開いてご利用ください');
    } else {
      result = convertDBMLToExcel(options.inputFile, options.outputPath);
      console.log('✅ CSV変換完了!');
      console.log(`📁 出力ディレクトリ: ${result.outputDir}`);
      console.log(`📋 ${result.tablesCount}個のテーブルを変換しました`);
      console.log('💡 CSVファイルをExcelで開いてご利用ください');
    }
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
    process.exit(1);
  }
}

/**
 * コマンドライン引数の解析
 */
function parseArguments(args) {
  const options = {
    inputFile: '',
    outputPath: '',
    format: 'csv'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format') {
      if (i + 1 < args.length) {
        const format = args[i + 1].toLowerCase();
        if (format === 'csv' || format === 'xlsx') {
          options.format = format;
          i++; // 次の引数をスキップ
        } else {
          throw new Error('--format は csv または xlsx を指定してください');
        }
      } else {
        throw new Error('--format オプションに値が指定されていません');
      }
    } else if (!options.inputFile) {
      options.inputFile = arg;
    } else if (!options.outputPath) {
      options.outputPath = arg;
    }
  }

  if (!options.inputFile) {
    throw new Error('DBMLファイルを指定してください');
  }

  // デフォルト出力パスの設定
  if (!options.outputPath) {
    if (options.format === 'xlsx') {
      options.outputPath = options.inputFile.replace(/\.dbml$/, '') + '.xlsx';
    } else {
      // CSVファイル用のディレクトリ名を入力ファイルベースに設定
      const baseName = options.inputFile.replace(/\.dbml$/, '');
      options.outputPath = baseName + '_csv';
    }
  }

  return options;
}

if (require.main === module) {
  main();
}

module.exports = { main };
