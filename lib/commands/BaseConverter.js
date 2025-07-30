"use strict";

const path = require('path');
const {
  parseDBMLFile,
  normalizeDatabase
} = require('../helpers/dbmlParser');

/**
 * Base converter class following @dbml/cli patterns
 * Provides common functionality for all conversion commands
 */
class BaseConverter {
  constructor() {
    this.supportedFormats = ['csv', 'xlsx'];
  }

  /**
   * Validate input file exists and is readable
   * @param {string} inputPath - Path to DBML file
   * @throws {Error} If file doesn't exist or isn't readable
   */
  validateInput(inputPath) {
    const fs = require('fs');
    if (!fs.existsSync(inputPath)) {
      throw new Error(`DBML file not found: ${inputPath}`);
    }
  }

  /**
   * Parse DBML file and normalize database structure
   * @param {string} inputPath - Path to DBML file
   * @returns {Object} Normalized database object
   */
  parseInput(inputPath) {
    this.validateInput(inputPath);
    const database = parseDBMLFile(inputPath);
    return normalizeDatabase(database);
  }

  /**
   * Resolve output path based on input and format
   * @param {string} inputPath - Input file path
   * @param {string} outputPath - Specified output path (may be null)
   * @param {string} format - Output format
   * @returns {string} Resolved output path
   */
  resolveOutputPath(inputPath, outputPath, format) {
    if (outputPath) {
      return outputPath;
    }

    // Default output path based on input file
    const inputDir = path.dirname(inputPath);
    const inputName = path.basename(inputPath, path.extname(inputPath));
    switch (format) {
      case 'csv':
        return path.join(inputDir, `${inputName}_csv`);
      case 'xlsx':
        return path.join(inputDir, `${inputName}.xlsx`);
      default:
        return inputDir;
    }
  }

  /**
   * Check if path represents a directory
   * @param {string} filepath - File path to check
   * @returns {boolean} True if directory
   */
  isDirectory(filepath) {
    const ext = path.extname(filepath);
    return !ext || filepath.endsWith('/') || filepath.endsWith('\\');
  }
}
module.exports = BaseConverter;