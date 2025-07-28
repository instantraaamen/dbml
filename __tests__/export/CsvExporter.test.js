const CsvExporter = require('../../src/export/CsvExporter');

describe('CsvExporter', () => {
  let exporter;

  beforeEach(() => {
    exporter = new CsvExporter();
  });

  describe('constructor', () => {
    test('should create CsvExporter instance with correct format', () => {
      expect(exporter).toBeInstanceOf(CsvExporter);
      expect(exporter.format).toBe('csv');
    });
  });

  describe('export', () => {
    const mockDatabase = {
      tables: [
        {
          name: 'users',
          note: 'ユーザー情報テーブル',
          fields: [
            {
              name: 'id',
              type: 'bigint',
              pk: true,
              increment: true,
              note: 'ユーザーID'
            },
            {
              name: 'name',
              type: 'varchar(100)',
              not_null: true,
              note: 'ユーザー名'
            }
          ]
        },
        {
          name: 'products',
          note: '商品情報テーブル',
          fields: [
            {
              name: 'id',
              type: 'bigint',
              pk: true,
              increment: true,
              note: '商品ID'
            }
          ]
        }
      ]
    };

    test('should export database to CSV format', () => {
      const result = exporter.export(mockDatabase);

      expect(result).toEqual({
        format: 'csv',
        files: expect.objectContaining({
          'tables_overview.csv': expect.any(String),
          'users.csv': expect.any(String),
          'products.csv': expect.any(String)
        }),
        tablesCount: 2
      });
    });

    test('should generate correct tables overview CSV', () => {
      const result = exporter.export(mockDatabase);
      const overviewCsv = result.files['tables_overview.csv'];

      expect(overviewCsv).toContain('テーブル名,説明,フィールド数');
      expect(overviewCsv).toContain('users,ユーザー情報テーブル,2');
      expect(overviewCsv).toContain('products,商品情報テーブル,1');
    });

    test('should generate correct table CSV content', () => {
      const result = exporter.export(mockDatabase);
      const usersCsv = result.files['users.csv'];

      expect(usersCsv).toContain(
        'フィールド名,データ型,NULL許可,デフォルト値,主キー,ユニーク,自動増分,説明'
      );
      expect(usersCsv).toContain('id,bigint,○,,○,,○,ユーザーID');
      expect(usersCsv).toContain('name,varchar(100),×,,,,,ユーザー名');
    });

    test('should handle complex field types', () => {
      const complexDatabase = {
        tables: [
          {
            name: 'test_table',
            note: '',
            fields: [
              {
                name: 'complex_field',
                type: {
                  type_name: 'decimal',
                  args: ['10', '2']
                },
                not_null: false,
                default: '0.00',
                note: 'Complex type field'
              }
            ]
          }
        ]
      };

      const result = exporter.export(complexDatabase);
      const tableCsv = result.files['test_table.csv'];

      expect(tableCsv).toContain(
        'complex_field,"decimal(10, 2)",○,0.00,,,,Complex type field'
      );
    });

    test('should throw error for invalid database structure', () => {
      expect(() => exporter.export({})).toThrow(
        'Invalid database structure: tables array required'
      );
      expect(() => exporter.export({ tables: null })).toThrow(
        'Invalid database structure: tables array required'
      );
      expect(() => exporter.export({ tables: 'not_array' })).toThrow(
        'Invalid database structure: tables array required'
      );
    });

    test('should handle empty tables array', () => {
      const emptyDatabase = { tables: [] };
      const result = exporter.export(emptyDatabase);

      expect(result.tablesCount).toBe(0);
      expect(result.files['tables_overview.csv']).toContain(
        'テーブル名,説明,フィールド数'
      );
    });
  });
});
