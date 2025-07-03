module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: ['../../.eslintrc'],
  globals: {
    vi: "readonly",
    describe: "readonly",
    it: "readonly", 
    expect: "readonly",
    beforeEach: "readonly",
    afterEach: "readonly",
    beforeAll: "readonly",
    afterAll: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "camelcase": ["error", { "properties": "never" }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    "no-console": ['error', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['*.config.js', '*.config.ts', 'webpack.*.js'],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "import/no-dynamic-require": "off",
      },
    },
    {
      files: ['*.test.ts', '*.test.tsx'],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-function": "off",
      },
    },
  ],
  ignorePatterns: ["dist", "node_modules", "coverage"]
}; 