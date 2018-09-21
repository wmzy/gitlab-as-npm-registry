module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['security', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:security/recommended',
    'eslint-config-prettier'
  ],
  rules: {
    "node/exports-style": ["error", "module.exports"],
    'prettier/prettier': ['error'],
    'no-return-assign': ['error', 'except-parens'],
    'no-shadow': 'off',
    'no-param-reassign': 'off',
    'no-use-before-define': ["error", { "functions": false }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
