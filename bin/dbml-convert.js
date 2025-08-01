#!/usr/bin/env node

/**
 * dbml-convert - Unified conversion command (legacy compatibility)
 * Maintains backward compatibility while following @dbml/cli patterns
 */

const { Command } = require('commander');
const { convertToFormat } = require('../lib/index');

const program = new Command();

program
  .name('dbml-convert')
  .description('Convert DBML files to various formats (CSV, Excel)')
  .version(require('../package.json').version)
  .usage('<input> [output] [options]')
  .option('-f, --format <format>', 'Output format (csv, xlsx)', 'csv')
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
      console.log(`Format: ${options.format.toUpperCase()}`);
    }

    const result = await convertToFormat(
      input,
      output,
      options.format,
      options
    );

    // Display results
    console.log('✅ Conversion completed successfully');

    if (result.outputDirectory) {
      console.log(`📁 Output directory: ${result.outputDirectory}`);
      console.log(`📄 Files created: ${result.files.join(', ')}`);
    } else {
      console.log(`📄 Output file: ${result.filePath}`);
    }

    console.log(`📊 Tables processed: ${result.tablesCount}`);

    if (result.worksheets) {
      console.log(`📋 Worksheets: ${result.worksheets.join(', ')}`);
    }

    if (options.verbose) {
      console.log('\nConversion details:');
      console.log(`- Format: ${result.format}`);
      if (result.files) {
        console.log(`- Files: ${result.files.length}`);
      }
      if (result.worksheets) {
        console.log(`- Worksheets: ${result.worksheets.length}`);
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
    '  $ dbml-convert database.dbml --format csv   # Convert to CSV (multiple files)'
  );
  console.log(
    '  $ dbml-convert database.dbml --format xlsx  # Convert to Excel'
  );
  console.log(
    '  $ dbml-convert database.dbml output/ -f csv # Convert to specific directory'
  );
  console.log(
    '  $ dbml-convert database.dbml out.xlsx -f xlsx # Convert to specific file'
  );
  console.log(
    '  $ dbml-convert database.dbml --verbose      # Convert with detailed output'
  );
  console.log('');
  console.log('Note: Consider using the specialized commands:');
  console.log('  - dbml2csv for CSV conversion');
  console.log('  - dbml2xlsx for Excel conversion');
  console.log('');
});
