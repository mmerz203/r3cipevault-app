import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      react: pluginReact
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];