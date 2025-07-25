const fs = require('fs');
const path = require('path');
const { convertDBMLToExcel } = require('../pkg/dbmlToExcel');

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(__dirname, 'temp');
const TEST_OUTPUT_DIR = path.join(TEST_DIR, 'output');

// テスト用のDBMLファイル
const TEST_DBML_CONTENT = `
Table users {
  id bigint [pk, increment, note: 'ユーザーID']
  name varchar(100) [not null, note: 'ユーザー名']
  email varchar(255) [not null, unique, note: 'メールアドレス']
  created_at timestamp [default: 'CURRENT_TIMESTAMP', note: '作成日時']
  
  Note: 'ユーザー情報テーブル'
}

Table products {
  id bigint [pk, increment, note: '商品ID']
  name varchar(200) [not null, note: '商品名']
  price decimal(10,2) [not null, note: '価格']
  
  Note: '商品情報テーブル'
}
`;

describe('DBML to Excel Integration Tests', () => {
  
  beforeEach(() => {
    // テスト用ディレクトリを作成
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });
  
  afterEach(() => {
    // テスト用ファイルをクリーンアップ
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('convertDBMLToExcel', () => {
    test('should convert DBML file to CSV files', () => {
      const testFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testFile, TEST_DBML_CONTENT);
      
      const result = convertDBMLToExcel(testFile, TEST_OUTPUT_DIR);
      
      expect(result.tablesCount).toBe(2);
      expect(result.files).toEqual(['users.csv', 'products.csv']);
      expect(result.outputDir).toBe(TEST_OUTPUT_DIR);
      
      // ファイルが作成されていることを確認
      expect(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'users.csv'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_OUTPUT_DIR, 'products.csv'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_OUTPUT_DIR, '_テーブル一覧.csv'))).toBe(true);
    });

    test('should create output directory if it does not exist', () => {
      const testFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testFile, TEST_DBML_CONTENT);
      
      const nonExistentDir = path.join(TEST_DIR, 'new_output');
      
      convertDBMLToExcel(testFile, nonExistentDir);
      
      expect(fs.existsSync(nonExistentDir)).toBe(true);
    });

    test('should generate table list CSV with correct content', () => {
      const testFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testFile, TEST_DBML_CONTENT);
      
      convertDBMLToExcel(testFile, TEST_OUTPUT_DIR);
      
      const listFile = path.join(TEST_OUTPUT_DIR, '_テーブル一覧.csv');
      const content = fs.readFileSync(listFile, 'utf8');
      const lines = content.split('\n');
      
      expect(lines[0]).toBe('テーブル名,説明,フィールド数');
      expect(lines).toHaveLength(3); // ヘッダー + 2テーブル
    });

    test('should handle DBML with minimal content', () => {
      const minimalDBML = `
        Table empty_table {
          id int [pk]
        }
      `;
      const testFile = path.join(TEST_DIR, 'minimal.dbml');
      fs.writeFileSync(testFile, minimalDBML);
      
      const result = convertDBMLToExcel(testFile, TEST_OUTPUT_DIR);
      
      expect(result.tablesCount).toBe(1);
      expect(result.files).toEqual(['empty_table.csv']);
    });

    test('should throw error for invalid file', () => {
      expect(() => {
        convertDBMLToExcel('non-existent.dbml', TEST_OUTPUT_DIR);
      }).toThrow('DBMLファイルが見つかりません');
    });
  });

  describe('CSV content validation', () => {
    test('should generate valid CSV content', () => {
      const testFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testFile, TEST_DBML_CONTENT);
      
      convertDBMLToExcel(testFile, TEST_OUTPUT_DIR);
      
      const usersCSV = fs.readFileSync(path.join(TEST_OUTPUT_DIR, 'users.csv'), 'utf8');
      const lines = usersCSV.split('\n');
      
      // ヘッダー行の確認
      expect(lines[0]).toBe('フィールド名,データ型,NULL許可,デフォルト値,主キー,ユニーク,自動増分,説明');
      
      // データ行の確認（usersテーブルは4フィールド）
      expect(lines).toHaveLength(5); // ヘッダー + 4フィールド
      
      // 各行がカンマで正しく区切られていることを確認
      lines.slice(1).forEach(line => {
        const fields = line.split(',');
        expect(fields).toHaveLength(8); // 8つの列
      });
    });
  });
});