const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// テスト用の一時ディレクトリ
const TEST_DIR = path.join(__dirname, '../temp');

// テスト用のDBMLファイル内容
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

describe('CLI Integration Tests', () => {
  const cliPath = path.join(__dirname, '../../bin/dbml-convert.js');

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

  describe('dbml-convert CLI', () => {
    test('should show help when no arguments provided', async () => {
      try {
        await execAsync(`node ${cliPath}`);
      } catch (error) {
        // CLI should exit with error code when no args provided
        expect(error.code).toBeGreaterThan(0);
        expect(error.stderr).toContain('error: missing required argument');
      }
    });

    test('should show version information', async () => {
      const { stdout } = await execAsync(`node ${cliPath} --version`);
      expect(stdout.trim()).toMatch(/\d+\.\d+\.\d+/);
    });

    test('should show help information', async () => {
      const { stdout } = await execAsync(`node ${cliPath} --help`);
      expect(stdout).toContain('DBML Converter Extensions');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('--format');
      expect(stdout).toContain('Examples:');
    });

    test('should convert DBML to CSV format', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputDir = path.join(TEST_DIR, 'csv_output');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const { stdout } = await execAsync(
        `node ${cliPath} "${testDbmlFile}" "${outputDir}" --format csv`
      );

      expect(stdout).toContain('Conversion completed successfully');
      expect(fs.existsSync(path.join(outputDir, 'tables_overview.csv'))).toBe(
        true
      );
      expect(fs.existsSync(path.join(outputDir, 'users.csv'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'products.csv'))).toBe(true);
    });

    test('should convert DBML to Excel format', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const { stdout } = await execAsync(
        `node ${cliPath} "${testDbmlFile}" "${outputFile}" --format xlsx`
      );

      expect(stdout).toContain('Conversion completed successfully');
      expect(fs.existsSync(outputFile)).toBe(true);
    }, 15000); // Excel conversion may take longer

    test('should handle verbose output', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      const outputFile = path.join(TEST_DIR, 'output.xlsx');

      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const { stdout } = await execAsync(
        `node ${cliPath} "${testDbmlFile}" "${outputFile}" --format xlsx --verbose`
      );

      expect(stdout).toContain('Converting');
      expect(stdout).toContain('Tables processed: 2');
      expect(stdout).toContain('Worksheets:');
    }, 15000);

    test('should handle invalid input file', async () => {
      const nonExistentFile = path.join(TEST_DIR, 'nonexistent.dbml');

      try {
        await execAsync(`node ${cliPath} "${nonExistentFile}" --format csv`);
      } catch (error) {
        expect(error.code).toBeGreaterThan(0);
        expect(error.stderr).toContain('Conversion failed');
      }
    });

    test('should handle invalid format', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      try {
        await execAsync(`node ${cliPath} "${testDbmlFile}" --format invalid`);
      } catch (error) {
        expect(error.code).toBeGreaterThan(0);
        expect(error.stderr).toContain('Unsupported format');
      }
    });

    test('should use default output path when not specified', async () => {
      const testDbmlFile = path.join(TEST_DIR, 'test.dbml');
      fs.writeFileSync(testDbmlFile, TEST_DBML_CONTENT);

      const { stdout } = await execAsync(
        `node ${cliPath} "${testDbmlFile}" --format xlsx`
      );

      expect(stdout).toContain('Conversion completed successfully');
      expect(fs.existsSync(path.join(TEST_DIR, 'test.xlsx'))).toBe(true);
    }, 15000);
  });
});
