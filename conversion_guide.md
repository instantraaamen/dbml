# DBML Conversion Quick Reference

This guide provides quick reference for DBML conversions using both standard tools and this extension package.

## Standard DBML CLI (@dbml/cli)

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

# Markdown documentation
dbml2docs database_spec.dbml --format md > database_docs.md

# HTML documentation
dbml2docs database_spec.dbml --format html > database_docs.html
```

### Programmatic Usage
```javascript
const { Parser, ModelExporter } = require('@dbml/core');
const fs = require('fs');

// Read and parse DBML
const dbmlContent = fs.readFileSync('database_spec.dbml', 'utf8');
const database = Parser.parse(dbmlContent, 'dbml');

// Export to different formats
const mysqlSchema = ModelExporter.export(database, 'mysql');
const postgresSchema = ModelExporter.export(database, 'postgres');

fs.writeFileSync('schema_mysql.sql', mysqlSchema);
fs.writeFileSync('schema_postgres.sql', postgresSchema);
```

## Extension Features (This Package)

### Installation
```bash
npm install -g dbml-converter-extensions
```

### Enhanced CSV/Excel Export
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

// CSV output (Excel-optimized)
const result = convertDBMLToExcel('input.dbml', 'output/');
console.log(`Generated ${result.tablesCount} CSV files`);

// Excel output with styling
const excelResult = await convertDBMLToExcelFile('input.dbml', 'output.xlsx');
console.log(`Generated Excel file with ${excelResult.worksheets.length} sheets`);
```

## Complete Workflow Example

```bash
# 1. Standard SQL generation
dbml2sql database_spec.dbml --postgres > schema.sql
dbml2sql database_spec.dbml --mysql > schema_mysql.sql

# 2. Documentation generation
dbml2docs database_spec.dbml --format md > database_docs.md

# 3. Enhanced Excel/CSV reports (extension)
dbml-convert database_spec.dbml --format xlsx        # Professional Excel report
dbml-convert database_spec.dbml --format csv         # Excel-optimized CSV files

# 4. Apply SQL to database
psql -U username -d database_name -f schema.sql
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Generate Database Assets
on: [push]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install DBML tools
        run: |
          npm install -g @dbml/cli
          npm install -g dbml-converter-extensions
      
      - name: Generate all formats
        run: |
          # Standard conversions
          dbml2sql schema.dbml --postgres > schema.sql
          dbml2docs schema.dbml --format md > database_docs.md
          
          # Extension: Enhanced reports
          dbml-convert schema.dbml database_report.xlsx --format xlsx
          dbml-convert schema.dbml csv_export --format csv
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: database-assets
          path: |
            *.sql
            *.md
            *.xlsx
            csv_export/
```

## VSCode Integration

### Extension Installation
```bash
code --install-extension matt-meyers.vscode-dbml
```

### Workspace Configuration (.vscode/tasks.json)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate PostgreSQL Schema",
      "type": "shell",
      "command": "dbml2sql",
      "args": ["${file}", "--postgres"],
      "group": "build"
    },
    {
      "label": "Generate Excel Report",
      "type": "shell",
      "command": "dbml-convert",
      "args": ["${file}", "--format", "xlsx"],
      "group": "build"
    }
  ]
}
```

## Online Tools

### ER Diagram Visualization
1. Visit [dbdiagram.io](https://dbdiagram.io)
2. Paste your DBML content
3. Get interactive ER diagram
4. Export as PDF or PNG

### Interactive Documentation
1. Visit [dbdocs.io](https://dbdocs.io)
2. Upload your DBML file
3. Get beautiful documentation website
4. Share with your team

## Common Command Patterns

```bash
# Quick conversions for all major databases
dbml2sql schema.dbml --postgres > postgres_schema.sql
dbml2sql schema.dbml --mysql > mysql_schema.sql
dbml2sql schema.dbml --sqlite > sqlite_schema.sql

# Documentation in multiple formats
dbml2docs schema.dbml --format md > docs.md
dbml2docs schema.dbml --format html > docs.html

# Extension: Comprehensive Excel reports
dbml-convert schema.dbml comprehensive_report.xlsx --format xlsx
dbml-convert schema.dbml csv_tables --format csv
```

## Tips and Best Practices

1. **Version Control**: Keep DBML files in version control, generate other formats in CI/CD
2. **Documentation**: Use `dbml2docs` for technical docs, extension Excel for business reports
3. **Database Migrations**: Generate SQL with `dbml2sql`, create migration scripts
4. **Team Collaboration**: Share ER diagrams via dbdiagram.io, Excel reports for stakeholders
5. **Automation**: Set up CI/CD to auto-generate all formats on DBML changes