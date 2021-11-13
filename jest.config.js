module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.ts'],
  coverageReporters: ["lcov"],
  collectCoverageFrom: [
    "src/**"
  ],
}
