module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/**/*.test.js'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'], // Comenta o elimina esta línea
};
