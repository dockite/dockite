module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**', '!src/ui/**'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest',
  },
};
