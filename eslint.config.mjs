import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: [
      "src/features/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/i18n/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app", "@/app/**", "**/app/**"],
              message:
                "App Router composes the application; reusable modules must not import routes.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/**",
                "react-dom",
                "react-dom/**",
                "next",
                "next/**",
                "next-intl",
                "next-intl/**",
                "@/**",
                "**/application/**",
                "**/components/**",
                "**/infrastructure/**",
                "**/server/**",
                "**/app/**",
              ],
              message:
                "Domain code must be framework independent. Use relative imports within the domain.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
