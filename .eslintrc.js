module.exports = {
  plugins: ['jest'],
  env: {
    commonjs: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true },
    ],
    'object-curly-spacing': ['error', 'always'],
    'no-console': [1, { allow: ['info', 'error'] }],
    'no-underscore-dangle': 0,
    'default-param-last': 0,
  },
}
