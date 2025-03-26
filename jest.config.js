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
      outputDirectory: '../reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // Setup files to run before each test
  setupFilesAfterEnv: [
    '../src/tests/setup.js'
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // An array of regexp pattern strings that are matched against all source file paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // The maximum amount of time a test can run before timing out
  testTimeout: 10000,

  // Indicates whether the test environment should be reset between each test
  resetMocks: true,

  // Indicates whether the test environment should be restored between each test
  restoreMocks: true,

  // Indicates whether the test environment should be cleared between each test
  clearMocks: true
};
