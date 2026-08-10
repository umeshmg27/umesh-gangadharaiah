import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Task 12: remove this temporary legacy migration exclusion after modernizing these files.
const legacyMigrationFiles = [
  'src/components/Navigation.tsx',
  'src/components/Main.tsx',
  'src/components/Expertise.tsx',
  'src/components/Timeline.tsx',
  'src/components/Project.tsx',
  'src/components/Recognition.tsx',
  'src/components/RecognitionModel.tsx',
  'src/components/Contact.tsx',
  'src/components/FadeIn.tsx',
  'src/components/index.js',
];

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules', ...legacyMigrationFiles],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
