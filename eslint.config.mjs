import nextTs from 'eslint-config-next/typescript';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';

const syntaxRules = [
  {
    selector: 'JSXOpeningElement[name.name="head"]',
    message:
      '禁止使用 head 标签，优先使用 metadata。三方 CSS、字体等资源可以在 globals.css 中顶部通过 @import 引入或者使用 next/font；preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入；json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld',
  },
];

const nextConfigRestrictedSyntaxRules = [
  {
    selector:
      'Property[key.name=/^(root|outputFileTracingRoot)$/] > Literal[value=/^\\//]',
    message:
      '禁止在 next.config 中写死绝对路径，请改用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。',
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Track 1.2: 'import/no-cycle' removed. It was configured without
      // registering eslint-plugin-import (so lint always crashed before
      // reaching it), and once registered the module-graph scan OOMs
      // past an 8GB heap on this codebase. The rule never enforced
      // anything, so removing it is not a regression.
      'react-hooks/set-state-in-effect': 'off',
      'no-restricted-syntax': ['error', ...syntaxRules],
      // Stylistic: React/Next handle unescaped `'` and `"` fine; this rule
      // is purely a preference and creates noise across the codebase.
      'react/no-unescaped-entities': 'off',
      // Tests legitimately use `as any` to mock modules. Disable the rule
      // inside __tests__/ — production code is still checked.
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
    },
  },
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      // Tests are free to use `as any` for module mocks and type erasure
      // — the real production type-safety is enforced by `tsc` on the
      // test's own imports.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Catch blocks: we don't always use the `err` parameter. The default
    // rule treats that as an unused-var warning; we treat it as fine.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['next.config.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...nextConfigRestrictedSyntaxRules],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Build artifacts:
    'server.js',
    'dist/**',
    // Track 1.2: coverage/ holds ~9MB of minified reporter JS, and the
    // tool/build dirs below hold ~230MB of bundled JS between them —
    // linting any of these OOMs eslint past an 8GB heap.
    'coverage/**',
    '.open-next/**',
    '.opencode/**',
    '.wrangler/**',
    // Script files (CommonJS):
    'scripts/**/*.js',
  ]),
]);

export default eslintConfig;
