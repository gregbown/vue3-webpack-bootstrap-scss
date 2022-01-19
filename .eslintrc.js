module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb'
  ],
  parserOptions: {
    "ecmaVersion": 2020,
    parser: 'babel-eslint'
  },
  rules: {
    "new-cap":0,
    "no-extra-bind": 0,
    "no-invalid-this": 0,
    "no-prototype-builtins": 0,
    "no-use-before-define": ["error", { "functions": true, "variables": true }],
    "linebreak-style": ["error", "unix"],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "comma-dangle": ["error", {
      "arrays": "never",
      "objects": "never",
      "imports": "never",
      "exports": "never",
      "functions": "never"
    }]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
  ],
};
