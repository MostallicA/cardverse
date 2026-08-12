/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/', '/__tests__/e2e/'],
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
  // TypeScript (NodeNext + "type": "module") imports relative modules with an
  // explicit .js extension (ESM-style). Jest in CommonJS mode cannot resolve
  // .js -> .ts on its own, so strip the extension and let the resolver fall
  // back to the .ts source files via moduleFileExtensions.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/generated/**/*',
  ],
};
