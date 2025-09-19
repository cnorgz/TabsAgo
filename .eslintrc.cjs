/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2021: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'import/order': [
      'warn',
      { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], 'newlines-between': 'always' }
    ],
    'no-console': ['warn', { allow: ['error', 'warn'] }],
  },
  ignorePatterns: ['dist/', 'node_modules/'],
}


