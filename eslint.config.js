import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        katex: "readonly",
        DOMParser: "readonly",
        JSZip: "readonly",
        performance: "readonly",
        Request: "readonly",
        Response: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      "prefer-const": "warn",
      "no-var": "warn",
    },
  },
];
