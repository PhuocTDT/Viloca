# Capability: Unit Test Infrastructure

## Purpose

Provide a working Jest + TypeScript test environment for the Viloca project so developers can run `npm test` and execute unit tests against pure functions without needing a React Native runtime.

## Requirements

### Requirement: Jest test runner is configured
The project SHALL have Jest + ts-jest installed as devDependencies and configured to run TypeScript tests without needing a React Native environment.

#### Scenario: npm test runs successfully
- **WHEN** developer runs `npm test`
- **THEN** Jest executes all `*.test.ts` files under `__tests__/` and reports pass/fail

#### Scenario: TypeScript paths resolve in tests
- **WHEN** a test file imports using `@/src/...` alias
- **THEN** Jest resolves the path correctly via `moduleNameMapper`

#### Scenario: tsconfig has no deprecation errors
- **WHEN** developer runs `npx tsc --noEmit`
- **THEN** output has zero errors (deprecation warning for `baseUrl` is silenced with `ignoreDeprecations`)

### Requirement: test script is registered in package.json
The project SHALL expose `npm test` as the standard command to run the test suite.

#### Scenario: npm test is available
- **WHEN** developer runs `npm test`
- **THEN** Jest runs without requiring any extra flags or global installs
