module.exports = {
    extends: ['airbnb-base'],
    env: {
      node: true,
      es2021: true,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
    },
  };
  