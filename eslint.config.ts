import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "node_modules",
      "build",
      "dist",
      ".expo",
      "*.log",
      "*.tgz",
      "*.apk",
      "*.aab",
      ".env*",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        _DEV_: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "simple-import-sort": simpleImportSort,
      prettier: eslintPluginPrettier,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-shadow": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "prettier/prettier": "warn",
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            // React-related packages
            ["^react$", "^react-native$", "^@react", "^react-dom$"],

            // Node.js built-ins
            ["^node:"],

            // External packages
            ["^\\w"],

            // Side effect imports
            ["^\\u0000"],

            // Absolute imports (e.g., aliased @ folders)
            ["^@"],

            // Relative imports
            ["^\\.\\.(?!/?$)", "^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["*/.{test,spec}.{ts,tsx,js,jsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
    },
  },
  prettier,
];
