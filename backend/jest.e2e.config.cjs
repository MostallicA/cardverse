/**
 * CardVerse backend — Jest configuration for End-to-End tests.
 *
 * E2E tests (src/__tests__/e2e) require a running backend server and a
 * PostgreSQL database, so they are intentionally separated from the default
 * unit-test run (jest.config.cjs excludes them via testPathIgnorePatterns).
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/e2e/*.test.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true,
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
  // Same ESM-style relative import handling as jest.config.cjs (NodeNext .js -> .ts).
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};