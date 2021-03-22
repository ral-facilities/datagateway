module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    jest: true,
    es6: true,
    node: true,
  },
  extends: [
    'react-app',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:cypress/recommended',
  ],
  plugins: ['prettier', 'cypress'],
  rules: {
    'react/jsx-filename-extension': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    'import/no-extraneous-dependencies': 'error',
  },
  overrides: [
    {
      // disable TS rules for JS files
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    allowImportExportEverywhere: true,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
