# DBML変換ガイド

## 概要

DBMLファイルを様々な形式に変換する方法を紹介します。

## 1. セットアップ

### CLI ツールのインストール

```bash
npm install -g @dbml/cli
```

## 2. SQL DDL生成

### MySQL

```bash
dbml2sql database_spec.dbml --mysql > schema.sql
```

### PostgreSQL

```bash
dbml2sql database_spec.dbml --postgres > schema.sql
```

### SQLite

```bash
dbml2sql database_spec.dbml --sqlite > schema.sql
```

## 3. ドキュメント生成

### Markdown形式

```bash
dbml2docs database_spec.dbml --format md > database_docs.md
```

### HTML形式

```bash
dbml2docs database_spec.dbml --format html > database_docs.html
```

## 4. 他の形式への変換

### Prisma Schema

```bash
dbml2prisma database_spec.dbml > schema.prisma
```

### JSON形式

```bash
dbml2json database_spec.dbml > database_spec.json
```

## 5. ER図の生成・表示

### Web上でER図を表示

1. https://dbdiagram.io にアクセス
2. DBMLファイルの内容をコピー&ペースト
3. 自動でER図が生成される
4. ブラウザのPDF出力機能でPDF保存可能

### インタラクティブドキュメント

1. https://dbdocs.io にアクセス
2. DBMLファイルをアップロード
3. 美しいドキュメントサイトが生成される

## 6. プログラマティックな変換

### Node.js での変換例

```javascript
const { Parser, ModelExporter } = require('@dbml/core');

// DBMLファイルを読み込み
const fs = require('fs');
const dbmlContent = fs.readFileSync('database_spec.dbml', 'utf8');

// パース
const database = Parser.parse(dbmlContent, 'dbml');

// MySQLに変換
const mysqlSchema = ModelExporter.export(database, 'mysql');
fs.writeFileSync('schema.sql', mysqlSchema);

// PostgreSQLに変換
const postgresSchema = ModelExporter.export(database, 'postgres');
fs.writeFileSync('schema_postgres.sql', postgresSchema);
```

## 7. 変換後の活用例

### DDLの実行

```bash
# MySQLの場合
mysql -u username -p database_name < schema.sql

# PostgreSQLの場合
psql -U username -d database_name -f schema_postgres.sql
```

### CI/CDでの自動化

```yaml
# GitHub Actions例
name: Generate Schema
on: [push]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install DBML CLI
        run: npm install -g @dbml/cli
      - name: Generate SQL
        run: |
          dbml2sql dbml/database_spec.dbml --mysql > schema.sql
          dbml2docs dbml/database_spec.dbml --format md > docs.md
      - name: Commit generated files
        run: |
          git add schema.sql docs.md
          git commit -m "Auto-generate schema and docs"
          git push
```

## 8. 実用的なワークフロー

1. **設計段階**: DBMLでスキーマ設計
2. **レビュー段階**: dbdiagram.ioでER図を共有・レビュー
3. **開発段階**: SQL DDLを生成してマイグレーション作成
4. **ドキュメント化**: Markdownやdbdocs.ioで仕様書作成
5. **メンテナンス**: DBMLファイルを更新して各形式を再生成

## 9. VSCode拡張機能

```bash
# DBML Language Support拡張機能をインストール
code --install-extension matt-meyers.vscode-dbml
```

これにより構文ハイライトとバリデーションが利用可能になります。

## 10. よく使うコマンド集

```bash
# 基本的な変換
dbml2sql database_spec.dbml --mysql
dbml2docs database_spec.dbml --format md

# ファイル出力
dbml2sql database_spec.dbml --mysql > schema.sql
dbml2docs database_spec.dbml --format md > docs.md

# 複数形式を一度に生成
dbml2sql database_spec.dbml --mysql > mysql_schema.sql
dbml2sql database_spec.dbml --postgres > postgres_schema.sql
dbml2docs database_spec.dbml --format md > database_docs.md
```
