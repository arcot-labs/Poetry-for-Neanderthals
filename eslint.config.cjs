// @ts-check
const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')
const angular = require('angular-eslint')
const csseslint = require('@eslint/css')
const { defineConfig } = require('eslint/config')
const eslintConfigPrettier = require('eslint-config-prettier/flat')

module.exports = defineConfig(
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.json',
            },
        },
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            ...angular.configs.tsRecommended,
            eslintConfigPrettier,
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
            '@angular-eslint/prefer-on-push-component-change-detection': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'default',
                    format: ['strictCamelCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'variableLike',
                    format: ['strictCamelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'typeLike',
                    format: ['StrictPascalCase'],
                },
                {
                    selector: 'enumMember',
                    format: ['StrictPascalCase'],
                },
            ],
            'no-console': 'warn',
            'no-restricted-imports': [
                'warn',
                {
                    patterns: [
                        {
                            group: ['.*'],
                            message:
                                'Avoid relative imports. Use path aliases instead',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
            ...angular.configs.templateAccessibility,
        ],
    },
    {
        files: ['**/*.css'],
        language: 'css/css',
        extends: [csseslint.default.configs.recommended],
        rules: {
            'css/no-important': 'off',
        },
    }
)
