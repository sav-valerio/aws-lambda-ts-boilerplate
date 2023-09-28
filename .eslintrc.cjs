module.exports = {
  env: {
    node: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'class-methods-use-this': 'off',
  },
};