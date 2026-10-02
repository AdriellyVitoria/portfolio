// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Fronteiras da arquitetura (ver frontend/README.md):
    // features → core/shared, scene → core, core → core, shared → shared.
    // Só a feature que hospeda o canvas (experiencia-3d) pode falar com a scene.
    files: ['src/app/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      'boundaries/elements': [
        { type: 'feature-3d', pattern: 'src/app/features/experiencia-3d' },
        { type: 'feature', pattern: 'src/app/features/*' },
        { type: 'scene', pattern: 'src/app/scene' },
        { type: 'core', pattern: 'src/app/core' },
        { type: 'shared', pattern: 'src/app/shared' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'feature-3d' } },
              allow: {
                to: {
                  element: { types: { anyOf: ['feature', 'scene', 'core', 'shared'] } },
                },
              },
            },
            {
              from: { element: { type: 'feature' } },
              allow: { to: { element: { types: { anyOf: ['feature', 'core', 'shared'] } } } },
            },
            {
              from: { element: { type: 'scene' } },
              allow: { to: { element: { types: { anyOf: ['scene', 'core'] } } } },
            },
            {
              from: { element: { type: 'core' } },
              allow: { to: { element: { type: 'core' } } },
            },
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
          ],
        },
      ],
    },
  },
  {
    // Dentro das camadas, proíbe importar arquivos fora delas (ex.: core → app.config.ts).
    // Os arquivos da raiz (app.ts, app.config.ts, app.routes.ts) compõem tudo e ficam livres.
    files: ['src/app/*/**/*.ts'],
    rules: { 'boundaries/no-unknown-dependencies': 'error' },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
