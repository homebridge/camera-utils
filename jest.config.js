module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!execa).+\\.js$'],
  coverageReporters: ['lcov'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}
