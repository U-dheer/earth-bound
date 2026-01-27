module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**'],
};