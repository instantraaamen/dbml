#!/usr/bin/env node

/**
 * dbml2csv - Convert DBML to CSV format
 * Specialized command following @dbml/cli patterns
 */

const { Command } = require('commander');
const CsvConverter = require('../lib/commands/CsvConverter');

const program = new Command();

program
  .name('dbml2csv')
  .description('Convert DBML files to CSV format')
  .version(require('../package.json').version)
  .usage('<input> [output] [options]')
  .option('-v, --verbose', 'Enable verbose output')
  .option(
    '--single-file',
    'Output as single overview file instead of multiple files'
  )
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
      console.log('Format: CSV');
    }

    const converter = new CsvConverter();
    const result = await converter.convert(input, output, options);

    // Display results
    console.log('✅ Conversion completed successfully');

    if (result.outputDirectory) {
      console.log(`📁 Output directory: ${result.outputDirectory}`);
      console.log(`📄 Files created: ${result.files.join(', ')}`);
    } else {
      console.log(`📄 Output file: ${result.filePath}`);
    }

    console.log(`📊 Tables processed: ${result.tablesCount}`);

    if (options.verbose) {
      console.log('\nConversion details:');
      console.log(`- Format: ${result.format}`);
      if (result.files) {
        console.log(`- Files: ${result.files.length}`);
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
    '  $ dbml2csv database.dbml                    # Convert to directory with multiple CSV files'
  );
  console.log(
    '  $ dbml2csv database.dbml output/            # Convert to specific directory'
  );
  console.log(
    '  $ dbml2csv database.dbml tables.csv        # Convert to single CSV file'
  );
  console.log(
    '  $ dbml2csv database.dbml --verbose          # Convert with detailed output'
  );
  console.log('');
});
