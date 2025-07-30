# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DBML Converter Extensions is a Node.js CLI tool that extends the official @dbml/cli package with enhanced CSV and Excel export capabilities. The project uses a modern architecture aligned with @dbml/cli patterns, featuring Babel compilation, command pattern implementation, and professional Excel/CSV generation with Japanese language support.

## Architecture

### Build System & Compilation

- **Source Code**: Located in `src/` (ES6+ syntax)
- **Compiled Output**: Babel transpiles to `lib/` for Node.js compatibility
- **Target**: Node.js 18+ with CommonJS modules
- **Build Command**: `npm run build` (required before testing/running)

### Command Pattern Architecture

The project follows @dbml/cli architectural patterns:

```
src/
├── commands/           # Command pattern implementations
│   ├── BaseConverter.js     # Abstract base class
│   ├── CsvConverter.js      # CSV conversion logic
│   └── ExcelConverter.js    # Excel conversion logic
├── exporters/          # Format-specific exporters
│   ├── CsvExporter.js       # CSV generation with Japanese headers
│   └── ExcelExporter.js     # Excel with professional styling
├── helpers/            # Utility functions
│   ├── dbmlParser.js        # DBML parsing with @dbml/core
│   ├── csvUtils.js          # CSV formatting utilities
│   ├── fileWriter.js        # File I/O operations
│   └── constants.js         # Shared constants
└── index.js            # Main API entry point
```

### Multi-Binary CLI Structure

Three CLI commands following @dbml/cli patterns:

- `bin/dbml2csv.js` - Specialized CSV conversion
- `bin/dbml2xlsx.js` - Specialized Excel conversion
- `bin/dbml-convert.js` - Unified interface (legacy compatibility)

## Development Commands

### Essential Commands

```bash
# Build the project (required before testing)
npm run build

# Run all tests (includes build)
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run single test file
npx jest test/commands/CsvConverter.test.js

# Code quality
npm run lint              # ESLint check
npm run lint:fix          # ESLint auto-fix
npm run format            # Prettier formatting
npm run format:check      # Prettier validation
```

### Testing Commands

```bash
# Run specific test suites
npx jest test/commands/           # Command tests only
npx jest test/integration/        # Integration tests only
npx jest --testNamePattern="CSV"  # Tests matching pattern

# Debug tests with verbose output
npm test -- --verbose

# CI-style testing (matches GitHub Actions)
npm run build && npm test && npm run lint && npm run format:check
```

### CLI Testing

```bash
# Test CLI commands locally
node bin/dbml2csv.js database_spec.dbml --help
node bin/dbml2xlsx.js database_spec.dbml output.xlsx
npm run convert database_spec.dbml test-output --format csv
```

## Code Organization Principles

### Command Pattern Implementation

- `BaseConverter`: Abstract base class with common functionality (validation, path resolution)
- `CsvConverter`/`ExcelConverter`: Concrete implementations for specific formats
- Each converter handles its own output logic (directory vs file, multiple CSV files vs single Excel)

### Exporter Pattern

- `CsvExporter`: Generates CSV content with Japanese headers (テーブル名, データ型, etc.)
- `ExcelExporter`: Creates professional Excel workbooks with styling, auto-width, borders
- Both exporters consume normalized DBML data from `dbmlParser`

### Error Handling Strategy

- User-friendly error messages with emoji indicators (✅, ❌)
- Comprehensive input validation in `BaseConverter.validateInput()`
- CI-aware file handling with retry logic for GitHub Actions reliability

### Japanese Language Support

The project includes native Japanese language support:

- CSV headers: フィールド名, データ型, NULL許可, デフォルト値, 主キー, ユニーク, 自動増分, 説明
- Excel worksheets: テーブル一覧 (table overview) + individual table sheets
- Unicode handling throughout the codebase

## Testing Architecture

### Test Structure

```
test/
├── commands/           # Unit tests for command classes
├── integration/        # End-to-end API tests
└── helpers/           # Test utilities and CI-optimized helpers
```

### CI-Optimized Testing

- `test/helpers/testUtils.js` contains utilities for reliable CI testing:
  - `createUniqueTestDir()`: Creates isolated test directories
  - `cleanupTestDir()`: Safe cleanup with retry logic
  - `waitForFileReady()`: File creation verification with CI awareness
- Jest configuration: `maxWorkers: 1`, `maxConcurrency: 1` for CI stability
- Test timeout: 120000ms for CI environments

### Test Isolation

Each test creates unique temporary directories to prevent interference. The test utilities handle CI-specific timing issues and file system reliability.

## Key Development Considerations

### Excel File Generation

The `ExcelExporter` includes sophisticated CI-aware file writing:

- Different strategies for CI vs local environments
- File existence verification with exponential backoff
- Buffer-based writing for CI reliability
- fsync operations for file system consistency

### Babel Configuration

- Target: Node.js 18.0.0 minimum
- Modules: CommonJS for compatibility
- Source maps disabled for production builds
- Copy files during compilation

### ESLint Rules

- Unused parameters prefixed with `_` are allowed
- Single quotes preferred, avoid escape rules
- 2-space indentation with switch case indentation
- No trailing commas, always end files with newline

### Package Distribution

- Published files: `lib/`, `bin/`, `README.md`, `LICENSE`, `conversion_guide.md`
- Main entry: `lib/index.js` (compiled)
- Three binary commands defined in package.json
- Pre-publish hooks ensure build and test completion

## Integration with DBML Ecosystem

This package is designed as an extension to @dbml/cli, not a replacement:

- Uses `@dbml/core` for official DBML parsing
- Complements standard conversions (SQL DDL, JSON, Markdown)
- Focuses on enhanced CSV/Excel export capabilities
- Maintains architectural consistency with @dbml/cli patterns

The `conversion_guide.md` file contains comprehensive examples of using this package alongside standard DBML tools in complete workflows.
