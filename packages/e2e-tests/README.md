# E2E Tests for LeaseUp

This package contains end-to-end tests for the LeaseUp property management application using Playwright and Testcontainers.

## Setup

### Prerequisites

- Node.js 18+
- Docker (for Testcontainers)
- pnpm

### Installation

From the root of the monorepo:

```bash
pnpm install
```

Install Playwright browsers:

```bash
cd packages/e2e-tests
pnpm install-browsers
```

### Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your test configuration.

## Running Tests

### From the root of the monorepo:

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode
pnpm test:e2e:ui

# Run tests in headed mode (visible browser)
pnpm test:e2e:headed

# Run only authentication tests
pnpm test:e2e:auth
```

### From the e2e-tests package:

```bash
cd packages/e2e-tests

# Run all tests
pnpm test

# Run with UI mode
pnpm test:ui

# Run in headed mode
pnpm test:headed

# Run specific test file
pnpm test tests/auth/login.spec.ts

# Run tests in debug mode
pnpm test:debug
```

## Test Structure

```
tests/
├── auth/
│   ├── login.spec.ts      # Login flow tests
│   └── signup.spec.ts     # Signup flow tests
└── fixtures/              # Test fixtures and data
```

## Utilities

- `utils/database.ts` - Testcontainers database management
- `utils/auth-helpers.ts` - Authentication test helpers
- `utils/test-helpers.ts` - General test utilities and fixtures

## Database Testing

Tests use Testcontainers to spin up isolated PostgreSQL containers for each test suite. This ensures:

- Complete test isolation
- No interference between tests
- Clean state for each test run
- Real database integration testing

## Authentication Testing

The test suite covers:

### Login Tests

- Valid login with correct credentials
- Invalid password handling
- Non-existent user handling
- Form validation (empty fields, invalid email format)
- Session persistence
- Loading states
- Network error handling

### Signup Tests

- Successful user registration
- Duplicate email handling
- Password confirmation validation
- Form validation (all required fields)
- Password strength validation
- Database user creation verification
- Loading states
- Network error handling

## CI/CD Integration

Tests are configured to run in CI environments with:

- Headless browser execution
- Retry logic for flaky tests
- Comprehensive reporting (HTML, JSON, JUnit)
- Screenshot and video capture on failures

## Debugging

### Debug Mode

```bash
pnpm test:debug
```

### UI Mode

```bash
pnpm test:ui
```

### View Test Reports

```bash
pnpm report
```

## Best Practices

1. **Test Isolation**: Each test runs with a fresh database container
2. **Real Integration**: Tests run against the actual Next.js application
3. **Comprehensive Coverage**: Tests cover both happy paths and error scenarios
4. **Maintainable Code**: Reusable helpers and utilities
5. **CI/CD Ready**: Containerized approach works in any environment

## Troubleshooting

### Docker Issues

- Ensure Docker is running
- Check Docker permissions
- Verify port availability (5432 for PostgreSQL)

### Test Failures

- Check test reports in `playwright-report/`
- Review screenshots in `test-results/`
- Verify application is running on correct port (3001)

### Database Issues

- Ensure migrations are up to date
- Check database connection strings
- Verify PostgreSQL container startup

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use the provided helper utilities
3. Ensure proper cleanup with the `cleanDb` fixture
4. Add appropriate assertions and error handling
5. Update this README if adding new test categories
