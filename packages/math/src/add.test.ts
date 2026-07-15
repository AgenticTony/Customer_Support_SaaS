import { expect, test } from "vitest";

import { add } from "./add";

test("add returns the sum of two numbers", () => {
  expect(add(2, 2)).toBe(4);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});
