import eslint from '@eslint/js';
import queryPlugin from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-config-prettier/flat';
import cypressPlugin from 'eslint-plugin-cypress';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactTestingLibraryPlugin from 'eslint-plugin-testing-library';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  cypressPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat.recommended,
  jsxA11yPlugin.flatConfigs.recommended,
  queryPlugin.configs['flat/recommended'],
  // See https://github.com/prettier/eslint-config-prettier put last
  prettierPlugin,
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2015,
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/?*test.{js,ts,jsx,tsx}'],
    plugins: reactTestingLibraryPlugin.configs['flat/react'].plugins,
    rules: reactTestingLibraryPlugin.configs['flat/react'].rules,
  }
);
