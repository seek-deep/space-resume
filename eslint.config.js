import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

const isProduction = process.env.NODE_ENV === "production";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react: react, // Add the react plugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Stricter rules for production builds
      "@typescript-eslint/no-unused-vars": isProduction
        ? [
            "error",
            { vars: "all", args: "after-used", ignoreRestSiblings: false },
          ]
        : ["warn", { vars: "all", args: "none", ignoreRestSiblings: true }],
      "no-unused-vars": isProduction
        ? [
            "error",
            { vars: "all", args: "after-used", varsIgnorePattern: "^_" },
          ]
        : ["warn", { vars: "all", args: "none", varsIgnorePattern: "^_" }],
      // Allow implicit 'any' for parameters
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // Suppress errors for JSX intrinsic elements like 'rimGlowMaterial'
      "react/jsx-no-undef": ["error", { allowGlobals: true }],
      // Allow implicit 'any' for function parameters
      "@typescript-eslint/no-implicit-any-catch": "off",
      // Suppress errors for mismatched types in JSX props
      "@typescript-eslint/no-unsafe-assignment": "off",
      // Correct configuration for "@typescript-eslint/ban-ts-comment"
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          "ts-expect-error": false, // Do not require descriptions for "@ts-expect-error"
        },
      ],
    },
  }
);
