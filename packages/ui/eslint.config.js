import { config } from "@workspace/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // Vendored shadcn/ui primitives — not code we maintain. Relax the strict
    // react-compiler purity rule so generated components (e.g. the sidebar
    // skeleton's intentional random-on-mount width) don't trip max-warnings-0.
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/purity": "off",
    },
  },
];
