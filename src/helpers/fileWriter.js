const fs = require('fs');
const path = require('path');

/**
 * ファイル書き込み用ヘルパー関数群
 * @dbml/cliのヘルパーパターンに準拠
 */

/**
 * ディレクトリが存在することを確認し、存在しない場合は作成
 * @param {string} dirPath - ディレクトリパス
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * CSVファイルを書き込み
 * @param {string} filePath - ファイルパス
 * @param {string} content - CSVコンテンツ
 */
function writeCSVFile(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDirectoryExists(dir);
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * 複数のCSVファイルを一括書き込み
 * @param {string} outputDir - 出力ディレクトリ
 * @param {Object} files - ファイル名とコンテンツのマップ
 */
function writeMultipleCSVFiles(outputDir, files) {
  ensureDirectoryExists(outputDir);

  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
  });
}

/**
 * テーブル用CSVファイルを書き込み
 * @param {string} outputDir - 出力ディレクトリ
 * @param {Array} tables - テーブル配列
 * @param {Function} converter - テーブルをCSVに変換する関数
 */
function writeTableCSVFiles(outputDir, tables, converter) {
  ensureDirectoryExists(outputDir);

  tables.forEach((table) => {
    const csvContent = converter(table);
    const filePath = path.join(outputDir, `${table.name}.csv`);
    fs.writeFileSync(filePath, csvContent, 'utf8');
  });
}

/**
 * ファイル書き込み完了を待機（テスト用）
 * @param {string} filePath - ファイルパス
 * @param {number} maxRetries - 最大リトライ回数
 * @returns {Promise<void>}
 */
async function waitForFileReady(filePath, maxRetries = 10) {
  const isCI =
    process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const retries = isCI ? Math.max(maxRetries, 35) : maxRetries;
  const baseDelay = isCI ? 25 : 15;
  const maxDelay = isCI ? 100 : 80;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          return;
        }
      } catch (error) {
        // statSync失敗は無視して再試行
      }
    }

    const delay = Math.min(baseDelay * Math.pow(1.2, attempt), maxDelay);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error(
    `File not ready after ${retries} attempts: ${filePath} (CI: ${isCI})`
  );
}

module.exports = {
  ensureDirectoryExists,
  writeCSVFile,
  writeMultipleCSVFiles,
  writeTableCSVFiles,
  waitForFileReady
};
