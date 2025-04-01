module.exports = {
  // The root directory that Jest should scan for files
  rootDir: 'src',

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // An array of regexp pattern strings that are matched against all source file paths
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/',
    '/tests/'
  ],

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: '../coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      uniqueOutputName: 'false',
      suiteNameTemplate: '{filepath}',
      addFileAttribute: true
    }]
  ],

  // Setup files to run before each test
  setupFilesAfterEnv: [
    './tests/setup.js'
  ],

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // The directory where Jest should store its cached dependency information
  cacheDirectory: '../node_modules/.cache/jest',

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/tests/**'
  ],

  // The maximum amount of time (in milliseconds) a test is allowed to run before it is considered timed out
  testTimeout: 10000,

  // Indicates whether each individual test should be reported during the run
  silent: false,

  // Indicates whether the coverage information should be collected while executing the test
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  }
};
