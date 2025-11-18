# Deployment process for unit tests


## Prerequisites

- Node.js (recommended LTS, e.g. 16+ or 18+). Verify with:

```pwsh
node -v
npm -v
```
- npm (or yarn/pnpm) for installing dependencies.
- Project dependencies installed (from repository root):

```pwsh
npm install
```

- Recommended dev dependencies for testing (install if missing):

```pwsh
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest @types/jest
```

Notes:
- The project uses Create React App + `react-scripts` test runner. Commands below assume that environment.
- Adjust package manager commands if you use `yarn` or `pnpm`.

## Step-by-step instructions

### 1) Run tests locally (single run)

From the project root run:

```pwsh
npm test -- --watchAll=false
```

This executes tests once and exits (non-interactive). Create React App's test runner will pick up your Jest configuration.

### 2) Run tests in watch mode (dev loop)

```pwsh
npm test
```

This runs the interactive watch mode. Press `a` to run all, `f` to run failing tests only, or `q` to quit.

### 3) Run tests with coverage

```pwsh
npm test -- --coverage --watchAll=false
```

This generates a coverage report (usually under `coverage/`) and exits.

### 4) Run a single test file

Pass the filename pattern to run tests that match it:

```pwsh
npm test -- src/components/__tests__/Login.test.tsx --watchAll=false
```

### 5) Headless / CI run

In many CI environments, set the `CI` environment variable to true so the test runner exits on completion:

```pwsh
$env:CI = 'true'
npm test -- --watchAll=false
```

On Linux/macOS shells you would use `CI=true npm test -- --watchAll=false`.

## Example: GitHub Actions workflow

Add a workflow file (e.g. `.github/workflows/test.yml`) with the test step. Minimal example:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        env:
          CI: true
        run: npm test -- --watchAll=false
```

Adjust `node-version` and `npm ci` vs `npm install` per your needs.

## Troubleshooting

- "Cannot find module '@testing-library/react'" or missing type declarations:
  - Ensure you ran `npm install` and that `@testing-library/react` is installed.
  - Install type packages for TypeScript editors: `@types/jest`, `@testing-library/jest-dom`.

- Tests find multiple elements when using label or text queries:
  - If `getByLabelText(/Name/i)` matches multiple elements (e.g. "Name" and "Last Name"), use an exact string (`getByLabelText('Name')`) or use `getAllBy...` variants and select the one you need.

- Tests hang or Jest doesn't exit:
  - Ensure `--watchAll=false` is passed in CI or set `CI=true` in environment.
  - Long-running timers may prevent exit: check for fake timers or unclosed async operations.

- Warnings about `act` or `ReactDOMTestUtils.act`:
  - Import `act` from `react` (`import { act } from 'react'`) rather than `react-dom/test-utils` to avoid deprecation warnings.

- Console output (noisy logs) during tests:
  - Remove or guard `console.log` calls in production code or mock/spy on console in tests if you want to assert logs.

- Styled-components or CSS-in-JS issues in tests:
  - Some style libraries require additional setup in the test environment. If you see snapshot/style differences, check library docs for test config.

## Recommended best practices

- Keep tests fast and deterministic. Avoid real network calls; mock fetch/XHR.
- Prefer React Testing Library queries that resemble how users interact (getByRole, getByLabelText, getByText) and prefer exact queries for clarity.
- Add CI test job that runs on pull requests and pushes to main to protect branches.
- Add coverage thresholds if you want to fail CI on low coverage (Jest supports `coverageThreshold` in config).

## Useful commands summary

```pwsh
npm install               # install deps
npm test                  # run tests in watch mode
npm test -- --watchAll=false    # run tests once (CI)
npm test -- --coverage --watchAll=false  # run tests & generate coverage
```

## Contacts / Notes

If tests fail consistently and you can't find a fix, capture a failing test's output and open an issue with:

- test filename
- error output
- Node/npm versions
- any recent changes that may have affected tests

This document can be extended with CI provider-specific steps (Azure Pipelines, GitLab CI, Bitbucket Pipelines) as needed.
