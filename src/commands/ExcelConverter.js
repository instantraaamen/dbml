const BaseConverter = require('./BaseConverter');
const ExcelExporter = require('../exporters/ExcelExporter');

/**
 * Excel conversion command following @dbml/cli patterns
 * Handles DBML to Excel/XLSX conversion
 */
class ExcelConverter extends BaseConverter {
  constructor() {
    super();
    this.format = 'xlsx';
  }

  /**
   * Convert DBML to Excel format
   * @param {string} inputPath - Input DBML file path
   * @param {string} outputPath - Output file path
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} Conversion result
   */
  async convert(inputPath, outputPath, options = {}) {
    // Parse input
    const database = this.parseInput(inputPath);

    // Resolve output path
    const resolvedOutputPath = this.resolveOutputPath(
      inputPath,
      outputPath,
      this.format
    );

    // Export to Excel
    const exporter = new ExcelExporter();
    const exportResult = await exporter.export(database, options);
    const saveResult = await exporter.saveToFile(resolvedOutputPath);

    return {
      format: exportResult.format,
      filePath: saveResult.filePath,
      worksheets: exportResult.worksheets,
      tablesCount: exportResult.tablesCount
    };
  }
}

module.exports = ExcelConverter;
