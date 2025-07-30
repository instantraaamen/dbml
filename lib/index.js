"use strict";

/**
 * DBML Converter Extensions - Main Entry Point
 * Following @dbml/cli architecture patterns
 *
 * This package provides extended DBML conversion utilities with enhanced
 * CSV and Excel export capabilities.
 */

// Command classes for programmatic usage
const CsvConverter = require('./commands/CsvConverter');
const ExcelConverter = require('./commands/ExcelConverter');

// Exporter classes for direct usage
const CsvExporter = require('./exporters/CsvExporter');
const ExcelExporter = require('./exporters/ExcelExporter');

// Helper utilities
const {
  parseDBMLFile,
  normalizeDatabase
} = require('./helpers/dbmlParser');
const {
  dataToCSV
} = require('./helpers/csvUtils');
const {
  writeCSVFile,
  writeMultipleCSVFiles
} = require('./helpers/fileWriter');

/**
 * Main conversion function - unified interface
 * @param {string} inputPath - Input DBML file path
 * @param {string} outputPath - Output path
 * @param {string} format - Output format ('csv' or 'xlsx')
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} Conversion result
 */
async function convertToFormat(inputPath, outputPath, format, options = {}) {
  switch (format.toLowerCase()) {
    case 'csv':
      {
        const converter = new CsvConverter();
        return await converter.convert(inputPath, outputPath, options);
      }
    case 'xlsx':
      {
        const converter = new ExcelConverter();
        return await converter.convert(inputPath, outputPath, options);
      }
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// Export main API following @dbml/cli patterns
module.exports = {
  // Main conversion function
  convertToFormat,
  // Command classes
  CsvConverter,
  ExcelConverter,
  // Exporter classes
  CsvExporter,
  ExcelExporter,
  // Utility functions
  parseDBMLFile,
  normalizeDatabase,
  dataToCSV,
  writeCSVFile,
  writeMultipleCSVFiles
};