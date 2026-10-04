import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { react },
    rules: {
      // Without this, `no-unused-vars` cannot see a component that is only
      // referenced inside JSX, because the JSX transform makes that reference
      // implicit. Every component therefore read as unused.
      //
      // `varsIgnorePattern: '^[A-Z_]'` was hiding this for the conventional
      // PascalCase names, so the only thing that surfaced was `motion` -
      // lowercase, and used as <motion.div>. Eight false positives in six files,
      // all one missing rule.
      //
      // Only this single rule is registered rather than
      // react.configs.flat.recommended, which would drag in a large set of
      // stylistic opinions (prop-types, jsx-sort-props, self-closing-comp) that
      // are not this repo's conventions and would bury any real finding.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
