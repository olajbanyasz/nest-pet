import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

let storybookRecommendedConfig = [];

try {
  // Optional: plugin may only be installed in client workspace.
  const storybook = await import('eslint-plugin-storybook');
  storybookRecommendedConfig = [storybook.default.configs['flat/recommended']];
} catch {
  storybookRecommendedConfig = [];
}

export default tseslint.config({
  ignores: ['eslint.config.mjs', '**/dist/**', '**/node_modules/**'],
}, eslint.configs.recommended, eslintPluginPrettierRecommended, // ======================
//    BACKEND (NestJS)
// ======================
{
  files: ['src/**/*.ts'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },
    sourceType: 'commonjs',
    parserOptions: {
      project: ['./tsconfig.json', './tsconfig.build.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
  },
}, // ======================
//    FRONTEND (React)
// ======================
{
  files: ['client/src/**/*.{ts,tsx}'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.jest,
    },
    sourceType: 'module',
    parserOptions: {
      project: ['./client/tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
  },
}, ...storybookRecommendedConfig);
