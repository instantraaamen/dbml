const fs = require('fs');
const path = require('path');
const {
  parseDBMLContent,
  parseDBMLFile,
  getTables,
  normalizeDatabase
} = require('../../src/helpers/dbmlParser');

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(__dirname, '../temp');

// テスト用のDBMLコンテンツ
const VALID_DBML_CONTENT = `
Table users {
  id bigint [pk, increment, note: 'ユーザーID']
  name varchar(100) [not null, note: 'ユーザー名']
  email varchar(255) [not null, unique, note: 'メールアドレス']
  
  Note: 'ユーザー情報テーブル'
}

Table products {
  id bigint [pk, increment, note: '商品ID']
  name varchar(200) [not null, note: '商品名']
  
  Note: '商品情報テーブル'
}
`;

const INVALID_DBML_CONTENT = `
Table invalid {
  id [pk
  name varchar
  // Missing closing brace
`;

describe('DBML Parser Helpers', () => {
  beforeEach(() => {
    // テスト用ディレクトリを作成
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // テスト用ファイルをクリーンアップ
    if (fs.existsSync(TEST_DIR)) {
      try {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
      } catch (error) {
        console.warn(
          'Warning: Could not clean up test directory:',
          error.message
        );
      }
    }
  });

  describe('parseDBMLContent', () => {
    test('should parse valid DBML content', () => {
      const result = parseDBMLContent(VALID_DBML_CONTENT);

      expect(result).toBeDefined();
      expect(result.schemas).toBeDefined();
      expect(Array.isArray(result.schemas)).toBe(true);
      expect(result.schemas[0].tables).toBeDefined();
      expect(result.schemas[0].tables).toHaveLength(2);

      const usersTable = result.schemas[0].tables.find(
        (t) => t.name === 'users'
      );
      expect(usersTable).toBeDefined();
      expect(usersTable.note).toBe('ユーザー情報テーブル');
      expect(usersTable.fields).toHaveLength(3);
    });

    test('should throw error for invalid DBML content', () => {
      expect(() => parseDBMLContent(INVALID_DBML_CONTENT)).toThrow(
        'Failed to parse DBML content'
      );
    });

    test('should throw error for empty content', () => {
      expect(() => parseDBMLContent('')).toThrow(
        'DBML content is empty or invalid'
      );
      expect(() => parseDBMLContent('   ')).toThrow(
        'DBML content is empty or invalid'
      );
      expect(() => parseDBMLContent(null)).toThrow(
        'DBML content is empty or invalid'
      );
      expect(() => parseDBMLContent(undefined)).toThrow(
        'DBML content is empty or invalid'
      );
    });

    test('should throw error for non-string content', () => {
      expect(() => parseDBMLContent(123)).toThrow(
        'DBML content is empty or invalid'
      );
      expect(() => parseDBMLContent({})).toThrow(
        'DBML content is empty or invalid'
      );
    });
  });

  describe('parseDBMLFile', () => {
    test('should parse valid DBML file', () => {
      const testFile = path.join(TEST_DIR, 'valid.dbml');
      fs.writeFileSync(testFile, VALID_DBML_CONTENT);

      const result = parseDBMLFile(testFile);

      expect(result).toBeDefined();
      expect(result.schemas).toBeDefined();
      expect(result.schemas[0].tables).toHaveLength(2);
    });

    test('should throw error for non-existent file', () => {
      const nonExistentFile = path.join(TEST_DIR, 'nonexistent.dbml');

      expect(() => parseDBMLFile(nonExistentFile)).toThrow(
        'DBML file not found'
      );
    });

    test('should throw error for invalid DBML file', () => {
      const testFile = path.join(TEST_DIR, 'invalid.dbml');
      fs.writeFileSync(testFile, INVALID_DBML_CONTENT);

      expect(() => parseDBMLFile(testFile)).toThrow(
        'Failed to read or parse DBML file'
      );
    });

    test('should handle empty DBML file', () => {
      const testFile = path.join(TEST_DIR, 'empty.dbml');
      fs.writeFileSync(testFile, '');

      expect(() => parseDBMLFile(testFile)).toThrow(
        'Failed to read or parse DBML file'
      );
    });
  });

  describe('getTables', () => {
    test('should return tables from valid database object', () => {
      const database = parseDBMLContent(VALID_DBML_CONTENT);
      const tables = getTables(database);

      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(2);
      expect(tables[0].name).toBe('users');
      expect(tables[1].name).toBe('products');
    });

    test('should return empty array for database without tables', () => {
      const database = {};
      const tables = getTables(database);

      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(0);
    });

    test('should return empty array for database with undefined tables', () => {
      const database = { tables: undefined };
      const tables = getTables(database);

      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(0);
    });

    test('should return empty array for null database', () => {
      const tables = getTables(null);

      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(0);
    });

    test('should handle non-array tables property', () => {
      const database = { tables: 'not-an-array' };
      const tables = getTables(database);

      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(0);
    });
  });

  describe('normalizeDatabase', () => {
    test('should normalize valid database object', () => {
      const database = parseDBMLContent(VALID_DBML_CONTENT);
      const normalized = normalizeDatabase(database);

      expect(normalized).toBeDefined();
      expect(Array.isArray(normalized.tables)).toBe(true);
      expect(normalized.tables).toHaveLength(2);

      normalized.tables.forEach((table) => {
        expect(Array.isArray(table.fields)).toBe(true);
      });
    });

    test('should handle database without tables', () => {
      const database = {};
      const normalized = normalizeDatabase(database);

      expect(normalized.tables).toEqual([]);
    });

    test('should normalize tables with missing fields', () => {
      const database = {
        schemas: [
          {
            tables: [
              { name: 'table1' },
              { name: 'table2', fields: null },
              { name: 'table3', fields: 'not-array' }
            ]
          }
        ]
      };

      const normalized = normalizeDatabase(database);

      expect(normalized.tables).toHaveLength(3);
      normalized.tables.forEach((table) => {
        expect(Array.isArray(table.fields)).toBe(true);
        expect(table.fields).toHaveLength(0);
      });
    });

    test('should preserve existing valid fields arrays', () => {
      const database = {
        schemas: [
          {
            tables: [
              {
                name: 'table1',
                fields: [
                  { name: 'field1', type: 'varchar' },
                  { name: 'field2', type: 'integer' }
                ]
              }
            ]
          }
        ]
      };

      const normalized = normalizeDatabase(database);

      expect(normalized.tables[0].fields).toHaveLength(2);
      expect(normalized.tables[0].fields[0].name).toBe('field1');
      expect(normalized.tables[0].fields[1].name).toBe('field2');
    });
  });
});
