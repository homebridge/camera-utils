import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['dist', 'docs'],
  rules: {
    'new-cap': 'off',
    'import/extensions': ['error', 'ignorePackages'],
    'import/order': 'off',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-line-alignment': 'error',
    'no-undef': 'error',
    'perfectionist/sort-exports': 'error',
    'perfectionist/sort-named-exports': 'error',
    'perfectionist/sort-named-imports': 'error',
    'quotes': ['error', 'single'],
    'sort-imports': 'off',
    'style/brace-style': ['error', '1tbs'],
    'style/quote-props': ['error', 'consistent-as-needed'],
    'test/no-only-tests': 'error',
    'unicorn/no-useless-spread': 'error',
    'unused-imports/no-unused-vars': ['error', { caughtErrors: 'none' }],
  },
  typescript: true,
  formatters: {
    markdown: true,
  },
})
