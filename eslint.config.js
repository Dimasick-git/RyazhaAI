import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ignores: ["**/dist/**", "**/release/**", "**/node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "warn",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: [
      "*.js",
      "scripts/**/*.js",
      "website/server/**/*.js",
      "website/scripts/**/*.js",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["build-release.js"],
    rules: {
      // Generates Makefile text inside template literals; the escaped `$`
      // is intentional even though JS doesn't require it.
      "no-useless-escape": "off",
    },
  },
];
