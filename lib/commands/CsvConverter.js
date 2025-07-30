"use strict";

const BaseConverter = require('./BaseConverter');
const CsvExporter = require('../exporters/CsvExporter');
const {
  writeMultipleCSVFiles,
  writeCSVFile
} = require('../helpers/fileWriter');

/**
 * CSV conversion command following @dbml/cli patterns
 * Handles DBML to CSV conversion with multiple output formats
 */
class CsvConverter extends BaseConverter {
  constructor() {
    super();
    this.format = 'csv';
  }

  /**
   * Convert DBML to CSV format
   * @param {string} inputPath - Input DBML file path
   * @param {string} outputPath - Output path (directory or file)
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Conversion result
   */
  async convert(inputPath, outputPath, _options = {}) {
    // Parse input
    const database = this.parseInput(inputPath);

    // Resolve output path
    const resolvedOutputPath = this.resolveOutputPath(inputPath, outputPath, this.format);

    // Export to CSV
    const exporter = new CsvExporter();
    const result = exporter.export(database);

    // Handle directory vs file output
    if (this.isDirectory(resolvedOutputPath)) {
      return await this.writeMultipleFiles(resolvedOutputPath, result);
    } else {
      return await this.writeSingleFile(resolvedOutputPath, result);
    }
  }

  /**
   * Write multiple CSV files to directory
   * @param {string} outputDir - Output directory
   * @param {Object} result - Export result with files
   * @returns {Promise<Object>} Write result
   */
  async writeMultipleFiles(outputDir, result) {
    writeMultipleCSVFiles(outputDir, result.files);
    return {
      format: result.format,
      outputDirectory: outputDir,
      files: Object.keys(result.files),
      tablesCount: result.tablesCount
    };
  }

  /**
   * Write single CSV file (overview only)
   * @param {string} outputPath - Output file path
   * @param {Object} result - Export result with files
   * @returns {Promise<Object>} Write result
   */
  async writeSingleFile(outputPath, result) {
    const overviewContent = result.files['tables_overview.csv'];
    writeCSVFile(outputPath, overviewContent);
    return {
      format: result.format,
      filePath: outputPath,
      tablesCount: result.tablesCount
    };
  }
}
module.exports = CsvConverter;