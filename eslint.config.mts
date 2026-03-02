import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier"
import { defineConfig } from "eslint/config"

export default defineConfig([
  tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    plugins: { js, prettier },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.jest } },
    rules: {
      "no-console": "warn",
      "prettier/prettier": "error",
      "no-duplicate-imports": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  { ignores: ["dist"] },
])
