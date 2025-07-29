#!/usr/bin/env node

/**
 * dbml-convert CLI バイナリエントリーポイント
 * @dbml/cliのbinパターンに準拠
 */

const { runCLI } = require('../src/cli');

// プロセス引数を渡してCLIを実行
runCLI(process.argv);
