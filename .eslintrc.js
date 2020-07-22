module.exports = {
  /* your base configuration of choice */
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    "prettier",
    "prettier/react"
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module'
  },
  plugins: ["prettier", "@typescript-eslint"],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    __static: true
  },
  rules: {
    // XXX - Temporarily disabled typescript errors
    "@typescript-eslint/explicit-function-return-type": "off",
    // disable for now...
    'linebreak-style': 0,
    // allow console and debugger in development
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "prettier/prettier": [
      "warn",
      {
        useTabs: false,
        tabWidth: 2,
        singleQuote: true,
        printWidth: 120
      }
    ],
  },
  settings: {
      react: {
          version: "detect"
      }
  }
}
