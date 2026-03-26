import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const noCrossAppImports = {
  patterns: [
    {
      group: ['**/app-alt/**', '@/app-alt/**', '@app-alt/**'],
      message: 'Do not import from app-alt in this package subtree.',
    },
  ],
}

const noCrossAppMainImports = {
  patterns: [
    {
      group: ['**/app-main/**', '@/app-main/**', '@app-main/**'],
      message: 'Do not import from app-main in this package subtree.',
    },
  ],
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/app-main/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', noCrossAppImports],
    },
  },
  {
    files: ['src/app-alt/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', noCrossAppMainImports],
    },
  },
  {
    files: [
      'src/core/auth/AuthProvider.tsx',
      'src/contexts/AuthContext.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
