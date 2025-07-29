const { Command } = require('commander');
const { convertToFormat } = require('./converter');
const { version } = require('../../package.json');

/**
 * CLI メインエントリーポイント
 * @dbml/cliのCLIパターンに準拠
 */

/**
 * dbml-convert コマンドの実装
 * @param {Array} argv - コマンドライン引数
 */
function dbmlConvert(argv) {
  const program = new Command();

  program
    .name('dbml-convert')
    .description(
      'DBML Converter Extensions - Enhanced CSV and Excel export utilities'
    )
    .version(version)
    .argument('<input>', 'DBML input file path')
    .argument('[output]', 'Output file or directory path')
    .option('-f, --format <format>', 'Output format (csv, xlsx)', 'csv')
    .option(
      '-o, --out-file <path>',
      'Output file path (alternative to positional argument)'
    )
    .option('--verbose', 'Enable verbose output')
    .helpOption('-h, --help', 'Display help information')
    .action(async (input, output, options) => {
      try {
        // 出力パスの決定
        const outputPath = options.outFile || output;

        // 形式の検証
        const format = options.format.toLowerCase();
        if (!['csv', 'xlsx'].includes(format)) {
          console.error(
            `Error: Unsupported format '${format}'. Supported formats: csv, xlsx`
          );
          process.exit(1);
        }

        if (options.verbose) {
          console.log(`Converting ${input} to ${format} format...`);
          if (outputPath) {
            console.log(`Output: ${outputPath}`);
          }
        }

        // 変換実行
        const result = await convertToFormat(
          input,
          outputPath,
          format,
          options
        );

        if (options.verbose) {
          console.log('✅ Conversion completed successfully');
          console.log(`📊 Tables processed: ${result.tablesCount}`);

          if (result.files) {
            console.log(
              `📁 Files generated: ${Object.keys(result.files).length}`
            );
          }

          if (result.worksheets) {
            console.log(`📋 Worksheets: ${result.worksheets.join(', ')}`);
          }
        } else {
          console.log('✅ Conversion completed successfully');
        }
      } catch (error) {
        console.error('❌ Conversion failed:', error.message);

        if (options.verbose) {
          console.error('Stack trace:', error.stack);
        }

        process.exit(1);
      }
    });

  // ヘルプとバージョン情報の追加
  program.addHelpText(
    'after',
    `
Examples:
  $ dbml-convert database.dbml --format csv
  $ dbml-convert database.dbml output.xlsx --format xlsx  
  $ dbml-convert database.dbml output/ --format csv --verbose

Standard DBML CLI (install separately):
  $ npm install -g @dbml/cli
  $ dbml2sql database.dbml --postgres > schema.sql
  $ dbml2docs database.dbml --format md > docs.md

For more information, visit: https://github.com/instantraaamen/dbml
  `
  );

  program.parse(argv);
}

/**
 * エラーハンドリング付きでCLIを実行
 * @param {Array} argv - コマンドライン引数
 */
function runCLI(argv) {
  try {
    dbmlConvert(argv);
  } catch (error) {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  }
}

module.exports = {
  dbmlConvert,
  runCLI
};
