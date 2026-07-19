import { nextJsConfig } from "@workspace/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "**/_generated/**",
      "**/.convex/**",
      // AudioWorklet processors run in their own global scope (AudioWorkletProcessor,
      // sampleRate, registerProcessor) and are served as static assets, not app code.
      "public/voice/worklets/**",
    ],
  },
  ...nextJsConfig,
];
