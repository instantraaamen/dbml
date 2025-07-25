const fs = require('fs');
const path = require('path');
const { parseDBMLFile, parseDBMLContent, getTables } = require('../pkg/dbmlParser');

const TEST_DIR = path.join(__dirname, 'temp');

const TEST_DBML_CONTENT = `
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

describe('DBML Parser', () => {
  
  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });
  
  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('parseDBMLContent', () => {
    test('should parse valid DBML content', () => {
      const result = parseDBMLContent(TEST_DBML_CONTENT);
      
      expect(result).toBeDefined();
      expect(result.tables).toBeDefined();
      expect(result.tables).toHaveLength(2);
      expect(result.tables[0].name).toBe('users');
      expect(result.tables[1].name).toBe('products');
    });

    test('should throw error for invalid DBML content', () => {
      expect(() => {
        parseDBMLContent('invalid dbml content');
      }).toThrow();
    });

    test('should throw error for empty content', () => {
      expect(() => {
        parseDBMLContent('');
      }).toThrow('DBMLの解析に失敗しました');
    });
  });

  describe('parseDBMLFile', () => {
    test('should parse valid DBML file', () => {
      const testFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testFile, TEST_DBML_CONTENT);
      
      const result = parseDBMLFile(testFile);
      
      expect(result).toBeDefined();
      expect(result.tables).toBeDefined();
      expect(result.tables).toHaveLength(2);
    });

    test('should throw error for non-existent file', () => {
      expect(() => {
        parseDBMLFile('non-existent.dbml');
      }).toThrow('DBMLファイルが見つかりません');
    });

    test('should throw error for invalid DBML file', () => {
      const testFile = path.join(TEST_DIR, 'invalid.dbml');
      fs.writeFileSync(testFile, 'invalid dbml content');
      
      expect(() => {
        parseDBMLFile(testFile);
      }).toThrow();
    });
  });

  describe('getTables', () => {
    test('should return tables from schema', () => {
      const schema = parseDBMLContent(TEST_DBML_CONTENT);
      const tables = getTables(schema);
      
      expect(tables).toHaveLength(2);
      expect(tables[0].name).toBe('users');
      expect(tables[1].name).toBe('products');
    });

    test('should return empty array for schema without tables', () => {
      const schema = { tables: null };
      const tables = getTables(schema);
      
      expect(tables).toEqual([]);
    });

    test('should return empty array for schema with undefined tables', () => {
      const schema = {};
      const tables = getTables(schema);
      
      expect(tables).toEqual([]);
    });
  });
});