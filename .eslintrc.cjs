module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'airbnb',
    'airbnb-typescript/base'
  ],
  include: [
    "tsconfig.json",
  ],
  overrides: [
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ["import"],
  rules: {
    'no-console': 'off',
    'consistent-return': 'off',
  },
  settings: {
    // eslint-import-resolver-typescript
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
      }
    }
  }
};
