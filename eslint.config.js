/**
 * ESLint flat config: TypeScript strict rules, React hooks, TSDoc syntax and layer boundaries.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

const noServices = {
  patterns: [{ group: ['@/services', '@/services/*'], allowTypeImports: true, message: 'Use a hook: this layer must not call services.' }],
};
const noContext = {
  patterns: [{ group: ['@/context', '@/context/*'], message: 'Components receive state by props.' }],
};

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, tsdoc },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
      'tsdoc/syntax': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  { files: ['src/pages/**/*.tsx'], rules: { 'no-restricted-imports': ['error', noServices] } },
  {
    files: ['src/components/**/*.tsx'],
    rules: { 'no-restricted-imports': ['error', { patterns: [...noServices.patterns, ...noContext.patterns] }] },
  },
);
