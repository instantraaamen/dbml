# DBML to Excel Converter

![CI](https://github.com/instantraaamen/dbml/workflows/%F0%9F%94%84%20Continuous%20Integration/badge.svg)
![Node.js Version](https://img.shields.io/badge/node-16%20%7C%2018%20%7C%2020-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Convert DBML (Database Markup Language) files to Excel-friendly CSV format with comprehensive table analysis.

## 🚀 Features

- **DBML Parsing**: Full support for DBML syntax including tables, fields, and relationships
- **CSV Generation**: Creates separate CSV files for each table with detailed field information
- **Table Overview**: Generates a summary CSV with table statistics
- **Excel Compatible**: Output format optimized for Excel import
- **CLI Interface**: Easy-to-use command line tool

## 📦 Installation

### NPM Package (Recommended)

```bash
# Install globally for CLI usage
npm install -g dbml-to-excel-converter

# Or install locally in your project
npm install dbml-to-excel-converter
```

### From Source

```bash
# Clone the repository
git clone https://github.com/instantraaamen/dbml.git
cd dbml

# Install dependencies
npm install
```

## 🔧 Usage

### Command Line Interface

#### Global Installation
```bash
# Convert DBML file to CSV
dbml-to-excel <input.dbml> <output-directory>

# Example
dbml-to-excel database_spec.dbml output/
```

#### Local Installation
```bash
# Using npx
npx dbml-to-excel <input.dbml> <output-directory>

# Using npm script (from source)
npm run convert <input.dbml> <output-directory>
```

### Programmatic Usage

```javascript
const { convertDBMLToExcel } = require('dbml-to-excel-converter');

const result = convertDBMLToExcel('input.dbml', 'output/');
console.log(`Converted ${result.tablesCount} tables`);
console.log(`Generated files: ${result.files.join(', ')}`);
```

## 📋 Output Format

The converter generates:

1. **Individual table CSV files**: One file per table with field details
2. **Table summary CSV**: Overview of all tables with statistics
3. **Excel-compatible format**: Ready for import into spreadsheet applications

### CSV Structure

Each table CSV contains:

- フィールド名 (Field Name)
- データ型 (Data Type)
- NULL許可 (NULL Allowed)
- デフォルト値 (Default Value)
- 主キー (Primary Key)
- ユニーク (Unique)
- 自動増分 (Auto Increment)
- 説明 (Description)

## 🧪 Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Check code formatting
npm run format:check

# Format code
npm run format
```

### CI/CD Pipeline

This project uses GitHub Actions for continuous integration with:

- ✅ **Multi-environment testing**: Node.js 16, 18, 20 on Ubuntu, Windows, macOS
- ✅ **Code quality checks**: ESLint and Prettier
- ✅ **Test coverage reporting**: 100% coverage with Codecov integration
- ✅ **Security scanning**: npm audit and Snyk
- ✅ **Build validation**: Artifact generation and validation

## 📊 Test Coverage

Current test coverage: **100%** across all modules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Resources

- [DBML Documentation](https://dbml.dbdiagram.io/)
- [DBML Core Library](https://github.com/holistics/dbml)
- [GitHub Actions](https://docs.github.com/en/actions)
