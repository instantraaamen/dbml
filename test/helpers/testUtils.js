const fs = require('fs');
const path = require('path');

/**
 * 各テスト用の独立した一時ディレクトリを作成
 * @param {string} testName - テスト名（省略可）
 * @returns {string} 作成されたディレクトリパス
 */
function createUniqueTestDir(testName = '') {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  const dirName = testName 
    ? `test-${testName.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}-${uniqueId}`
    : `test-${timestamp}-${uniqueId}`;
  
  const testDir = path.join(__dirname, '../temp', dirName);
  
  // ディレクトリを作成
  fs.mkdirSync(testDir, { recursive: true });
  
  return testDir;
}

/**
 * テストディレクトリを安全に削除
 * @param {string} testDir - 削除するディレクトリパス
 */
async function cleanupTestDir(testDir) {
  if (!testDir || !testDir.includes('temp')) {
    return; // 安全性チェック
  }
  
  const maxRetries = 5;
  const baseDelay = 50;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      return; // 成功
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.warn(`Warning: Could not clean up test directory: ${error.message}`);
        return;
      }
      // リトライ前に少し待機
      await new Promise(resolve => setTimeout(resolve, baseDelay * (attempt + 1)));
    }
  }
}

/**
 * ファイルが確実に作成されるまで待機
 * @param {string} filePath - 確認するファイルパス
 * @param {number} maxRetries - 最大リトライ回数
 * @returns {Promise<void>}
 */
async function waitForFileReady(filePath, maxRetries = 20) {
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const retries = isCI ? Math.max(maxRetries, 40) : maxRetries;
  const baseDelay = isCI ? 50 : 25;
  const maxDelay = isCI ? 200 : 100;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
          // CI環境では追加の読み込み可能性チェック
          if (isCI) {
            try {
              fs.readFileSync(filePath, { flag: 'r' });
              return; // 読み込み成功
            } catch (readError) {
              // 読み込み失敗時は継続
            }
          } else {
            return; // ローカル環境では存在とサイズのみチェック
          }
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
  createUniqueTestDir,
  cleanupTestDir,
  waitForFileReady
};
