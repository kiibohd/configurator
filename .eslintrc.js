module.exports = {
  /* your base configuration of choice */
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    "prettier",
    "prettier/react"
  ],

  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  plugins: ["prettier"],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    __static: true
  },
  rules: {
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
          version: "16.7.0-alpha.0"
      }
  }
}
