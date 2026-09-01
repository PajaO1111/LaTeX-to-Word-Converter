#!/usr/bin/env node
/**
 * test-runner.js
 * Simple Node.js-based test runner for ES modules
 */

import { fileURLToPath } from "url";
import path from "path";
import { globSync } from "glob";

// Mock test framework
globalThis.describe = function (name, fn) {
  console.log(`\n${name}`);
  fn();
};

globalThis.test = function (name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
};

globalThis.expect = function (value) {
  const createMatcher = (negate = false) => ({
    toBe: (expected) => {
      const passes = value === expected;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be ${expected}`);
      }
    },
    toEqual: (expected) => {
      const passes = JSON.stringify(value) === JSON.stringify(expected);
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${JSON.stringify(value)} ${negate ? "not " : ""}to equal ${JSON.stringify(expected)}`);
      }
    },
    toHaveLength: (len) => {
      const passes = value.length === len;
      if (negate ? passes : !passes) {
        throw new Error(`Expected length ${value.length} ${negate ? "not " : ""}to be ${len}`);
      }
    },
    toContain: (item) => {
      const passes = value.includes(item);
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to contain ${item}`);
      }
    },
    toHaveProperty: (prop) => {
      const passes = prop in value;
      if (negate ? passes : !passes) {
        throw new Error(`Expected object ${negate ? "not " : ""}to have property ${prop}`);
      }
    },
    toBeTruthy: () => {
      const passes = !!value;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be truthy`);
      }
    },
    toBeFalsy: () => {
      const passes = !value;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be falsy`);
      }
    },
    toBeGreaterThan: (expected) => {
      const passes = value > expected;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      const passes = value >= expected;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be >= ${expected}`);
      }
    },
    toBeLessThan: (expected) => {
      const passes = value < expected;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      const passes = value <= expected;
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to be <= ${expected}`);
      }
    },
    toMatch: (regex) => {
      const passes = regex.test(value);
      if (negate ? passes : !passes) {
        throw new Error(`Expected ${value} ${negate ? "not " : ""}to match ${regex}`);
      }
    },
    toThrow: () => {
      try {
        value();
        if (!negate) throw new Error(`Expected function to throw`);
      } catch (err) {
        if (negate) throw err;
        if (!err.message.includes("Expected")) return;
        throw err;
      }
    },
    get not() {
      return createMatcher(true);
    },
  });

  return createMatcher();
};

// Load and run tests
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testFiles = globSync("tests/**/*.test.js", { cwd: __dirname });

console.log(`Found ${testFiles.length} test files`);

(async () => {
  for (const file of testFiles) {
    const filePath = path.join(__dirname, file);
    const fileUrl = new URL(`file://${filePath.replace(/\\/g, "/")}`).href;
    console.log(`\n📝 ${file}`);
    try {
      await import(fileUrl);
    } catch (err) {
      console.error(`❌ Error loading ${file}:`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  console.log("\n✅ Tests completed");
})();
