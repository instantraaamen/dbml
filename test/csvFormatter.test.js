const { 
  getFieldDataType, 
  fieldToRowData, 
  convertTableToCSV, 
  convertTableListToCSV 
} = require('../pkg/csvFormatter');

describe('CSV Formatter', () => {
  
  describe('getFieldDataType', () => {
    test('should return simple type name', () => {
      const field = { type: { type_name: 'bigint' } };
      expect(getFieldDataType(field)).toBe('bigint');
    });

    test('should return type with arguments', () => {
      const field = { type: { type_name: 'varchar', args: [100] } };
      expect(getFieldDataType(field)).toBe('varchar(100)');
    });

    test('should return type with multiple arguments', () => {
      const field = { type: { type_name: 'decimal', args: [10, 2] } };
      expect(getFieldDataType(field)).toBe('decimal(10,2)');
    });

    test('should handle empty args array', () => {
      const field = { type: { type_name: 'text', args: [] } };
      expect(getFieldDataType(field)).toBe('text');
    });

    test('should handle null args', () => {
      const field = { type: { type_name: 'timestamp', args: null } };
      expect(getFieldDataType(field)).toBe('timestamp');
    });
  });

  describe('fieldToRowData', () => {
    test('should convert field to row data array', () => {
      const field = {
        name: 'id',
        type: { type_name: 'bigint' },
        pk: true,
        increment: true,
        not_null: true,
        note: 'ID'
      };

      const result = fieldToRowData(field);

      expect(result).toEqual([
        'id',
        'bigint',
        'NO',  // not_null: true means NO nulls allowed
        '',
        'YES', // pk: true
        'NO',
        'YES', // increment: true
        'ID'
      ]);
    });

    test('should handle field with default value', () => {
      const field = {
        name: 'created_at',
        type: { type_name: 'timestamp' },
        default_value: { value: 'CURRENT_TIMESTAMP' },
        note: '作成日時'
      };

      const result = fieldToRowData(field);

      expect(result).toEqual([
        'created_at',
        'timestamp',
        'YES', // not_null is falsy, so YES nulls allowed
        'CURRENT_TIMESTAMP',
        'NO',
        'NO',
        'NO',
        '作成日時'
      ]);
    });

    test('should handle field with quotes in note', () => {
      const field = {
        name: 'description',
        type: { type_name: 'text' },
        note: "User's description"
      };

      const result = fieldToRowData(field);

      expect(result[7]).toBe("Users description"); // quotes removed
    });
  });

  describe('convertTableToCSV', () => {
    test('should convert table to CSV format', () => {
      const table = {
        name: 'test_table',
        fields: [
          {
            name: 'id',
            type: { type_name: 'bigint' },
            pk: true,
            increment: true,
            not_null: true,
            note: 'ID'
          },
          {
            name: 'name',
            type: { type_name: 'varchar', args: [100] },
            not_null: true,
            note: '名前'
          }
        ]
      };

      const result = convertTableToCSV(table);
      const lines = result.split('\n');

      expect(lines[0]).toBe('フィールド名,データ型,NULL許可,デフォルト値,主キー,ユニーク,自動増分,説明');
      expect(lines[1]).toBe('id,bigint,NO,,YES,NO,YES,ID');
      expect(lines[2]).toBe('name,varchar(100),NO,,NO,NO,NO,名前');
    });

    test('should handle empty fields', () => {
      const table = {
        name: 'empty_table',
        fields: []
      };

      const result = convertTableToCSV(table);
      const lines = result.split('\n');

      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe('フィールド名,データ型,NULL許可,デフォルト値,主キー,ユニーク,自動増分,説明');
    });
  });

  describe('convertTableListToCSV', () => {
    test('should convert table list to CSV format', () => {
      const tables = [
        {
          name: 'users',
          note: 'ユーザー情報テーブル',
          fields: [{ name: 'id' }, { name: 'name' }]
        },
        {
          name: 'products',
          note: '商品情報テーブル',
          fields: [{ name: 'id' }, { name: 'name' }, { name: 'price' }]
        }
      ];

      const result = convertTableListToCSV(tables);
      const lines = result.split('\n');

      expect(lines[0]).toBe('テーブル名,説明,フィールド数');
      expect(lines[1]).toBe('users,ユーザー情報テーブル,2');
      expect(lines[2]).toBe('products,商品情報テーブル,3');
    });

    test('should handle empty tables array', () => {
      const result = convertTableListToCSV([]);
      const lines = result.split('\n');

      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe('テーブル名,説明,フィールド数');
    });

    test('should handle tables without notes', () => {
      const tables = [
        {
          name: 'test_table',
          fields: [{ name: 'id' }]
        }
      ];

      const result = convertTableListToCSV(tables);
      const lines = result.split('\n');

      expect(lines[1]).toBe('test_table,,1');
    });
  });
});