#!/usr/bin/env node

/**
 * dbml2xlsx - Convert DBML to Excel format
 * Specialized command following @dbml/cli patterns
 */

const { Command } = require('commander');
const ExcelConverter = require('../lib/commands/ExcelConverter');

const program = new Command();

program
  .name('dbml2xlsx')
  .description('Convert DBML files to Excel format')
  .version(require('../package.json').version)
  .usage('<input> [output] [options]')
  .option('-v, --verbose', 'Enable verbose output')
  .parse(process.argv);

const input = program.args[0];
const output = program.args[1];
const options = program;

if (!input) {
  console.error('Error: Input DBML file path is required');
  program.help();
}

(async () => {
  try {
    if (options.verbose) {
      console.log(`Converting DBML file: ${input}`);
      console.log(`Output: ${output || 'auto-detected'}`);
      console.log('Format: Excel (XLSX)');
    }

    const converter = new ExcelConverter();
    const result = await converter.convert(input, output, options);

    // Display results
    console.log('✅ Conversion completed successfully');
    console.log(`📄 Output file: ${result.filePath}`);
    console.log(`📊 Tables processed: ${result.tablesCount}`);
    console.log(`📋 Worksheets: ${result.worksheets.join(', ')}`);

    if (options.verbose) {
      console.log('\nConversion details:');
      console.log(`- Format: ${result.format}`);
      console.log(`- Worksheets: ${result.worksheets.length}`);
      try {
        console.log(
          `- File size: ${require('fs').statSync(result.filePath).size} bytes`
        );
      } catch (e) {
        // Ignore file size error
      }
    }
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    if (options.verbose) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
})();

// Add examples to help
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log(
    '  $ dbml2xlsx database.dbml                   # Convert to database.xlsx'
  );
  console.log(
    '  $ dbml2xlsx database.dbml output.xlsx      # Convert to specific file'
  );
  console.log(
    '  $ dbml2xlsx database.dbml --verbose        # Convert with detailed output'
  );
  console.log('');
});
