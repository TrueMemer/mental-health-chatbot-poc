module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleNameMapper: {
      "^#/enums/(.*)$": "<rootDir>/lib/enums/$1",
      "^#/interfaces/(.*)$": "<rootDir>/lib/interfaces/$1",
      "^#/actions/(.*)$": "<rootDir>/lib/actions/$1",
      "^#/cache-adapters/(.*)$": "<rootDir>/lib/cache-adapters/$1",
      "^#/flow-machine$": "<rootDir>/lib/flow-machine.ts",
  },
};