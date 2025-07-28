# DBML Converter Extensions

![CI](https://github.com/instantraaamen/dbml/workflows/%F0%9F%94%84%20Continuous%20Integration/badge.svg)
![Node.js Version](https://img.shields.io/badge/node-18%20%7C%2020%20%7C%2022-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

**Extended DBML conversion utilities that complement the official @dbml/cli package.**

This package provides enhanced CSV and Excel (XLSX) output capabilities for DBML files, featuring beautiful formatting, Japanese language support, and cross-platform compatibility.

## 🎯 Purpose

This is an **extension package** for [DBML CLI](https://github.com/holistics/dbml/tree/master/packages/dbml-cli). While the official `@dbml/cli` provides core conversion features (SQL DDL, JSON, etc.), this package focuses on:

- ✨ **Enhanced CSV output** with Excel-optimized formatting
- 📊 **Native Excel (XLSX) export** with professional styling
- 🎨 **Beautiful table formatting** with headers, borders, and auto-width
- 🌏 **Japanese language support** for headers and content
- 🚀 **Cross-platform compatibility** (Windows, macOS, Linux)

## 🔧 DBML Standard Conversions (Official @dbml/cli)

Before using this extension, you might want to use the standard DBML CLI tools:

### Installation
```bash
npm install -g @dbml/cli
```

### SQL DDL Generation
```bash
# PostgreSQL
dbml2sql database_spec.dbml --postgres > schema.sql

# MySQL  
dbml2sql database_spec.dbml --mysql > schema.sql

# SQLite
dbml2sql database_spec.dbml --sqlite > schema.sql
```

### Other Standard Formats
```bash
# JSON format
dbml2json database_spec.dbml > database_spec.json

# Documentation
dbml2docs database_spec.dbml --format md > database_docs.md
```

### Programmatic Usage
```javascript
const { Parser, ModelExporter } = require('@dbml/core');

const database = Parser.parse(dbmlContent, 'dbml');

// Generate SQL for different databases
const mysqlSchema = ModelExporter.export(database, 'mysql');
const postgresSchema = ModelExporter.export(database, 'postgres');
```

## 📦 Installation (This Extension)

```bash
# Install globally for CLI usage
npm install -g dbml-converter-extensions

# Or install locally in your project
npm install dbml-converter-extensions
```

## 🚀 Usage (Extension Features)

### Command Line Interface

```bash
# Enhanced CSV output (Excel-optimized)
dbml-convert database_spec.dbml --format csv

# Native Excel (XLSX) output with styling
dbml-convert database_spec.dbml --format xlsx

# Custom output paths
dbml-convert database_spec.dbml output/tables.xlsx --format xlsx
dbml-convert database_spec.dbml output_directory --format csv
```

### Programmatic Usage

```javascript
const { convertDBMLToExcel } = require('dbml-converter-extensions');
const { convertDBMLToExcelFile } = require('dbml-converter-extensions/pkg/excelConverter');

// CSV output
const result = convertDBMLToExcel('input.dbml', 'output/');
console.log(`Generated ${result.tablesCount} CSV files`);

// Excel output
const excelResult = await convertDBMLToExcelFile('input.dbml', 'output.xlsx');
console.log(`Generated Excel file with ${excelResult.worksheets.length} sheets`);
```

## 📊 Output Features

### Enhanced CSV Output
- **Excel-optimized formatting** with proper escaping
- **Japanese headers** (フィールド名, データ型, etc.)
- **Comprehensive field information** including constraints and comments
- **Table summary sheet** with overview statistics

### Excel (XLSX) Output
- **Professional styling** with colored headers and borders
- **Multi-sheet workbooks** (overview + individual tables)
- **Auto-adjusted column widths** for optimal readability
- **Native Excel format** - no CSV import needed

### Field Information Included
- フィールド名 (Field Name)
- データ型 (Data Type)
- NULL許可 (NULL Allowed)
- デフォルト値 (Default Value)
- 主キー (Primary Key)
- ユニーク (Unique)
- 自動増分 (Auto Increment)
- 説明 (Description)

## 🔗 Complete DBML Workflow

1. **Design**: Create DBML schema files
2. **Visualize**: Use [dbdiagram.io](https://dbdiagram.io) for ER diagrams
3. **Generate SQL**: Use `@dbml/cli` for database-specific DDL
4. **Export Data**: Use this extension for Excel/CSV reports
5. **Document**: Use `@dbml/cli` for Markdown documentation

### Typical Command Sequence
```bash
# Standard DBML CLI conversions
dbml2sql database_spec.dbml --postgres > schema.sql
dbml2docs database_spec.dbml --format md > docs.md

# Extension: Enhanced Excel/CSV export
dbml-convert database_spec.dbml --format xlsx
dbml-convert database_spec.dbml --format csv
```

## 🛠️ Development

### Running Tests
```bash
npm test                # Run all tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Run in watch mode
```

### Code Quality
```bash
npm run lint           # Run ESLint
npm run format         # Run Prettier
```

## 🌐 Ecosystem Integration

### VSCode Extension
```bash
code --install-extension matt-meyers.vscode-dbml
```

### CI/CD Integration
```yaml
- name: Generate Database Assets
  run: |
    # Standard conversions
    dbml2sql schema.dbml --postgres > schema.sql
    dbml2docs schema.dbml --format md > database_docs.md
    
    # Extension: Excel reports
    dbml-convert schema.dbml database_report.xlsx --format xlsx
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Resources

- **[DBML Official CLI](https://github.com/holistics/dbml/tree/master/packages/dbml-cli)** - Core DBML conversion tools
- **[DBML Documentation](https://dbml.dbdiagram.io/)** - DBML language specification
- **[dbdiagram.io](https://dbdiagram.io/)** - Online ER diagram generator
- **[dbdocs.io](https://dbdocs.io/)** - Interactive database documentation

## 🤝 Contributing

This package extends the DBML ecosystem. For core DBML features, contribute to the [official DBML repository](https://github.com/holistics/dbml).

For extension-specific features:
1. Fork this repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request