/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/Viloca/'],
  modulePathIgnorePatterns: ['<rootDir>/Viloca/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        ignoreDeprecations: '6.0',
        baseUrl: '.',
        paths: { '@/*': ['./*'] },
        esModuleInterop: true,
        types: ['jest', 'node'],
      },
    }],
  },
};
