module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always']
  }
};
