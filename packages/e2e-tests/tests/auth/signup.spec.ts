import { test, expect } from '../../utils/test-helpers.js';
import { AuthHelpers } from '../../utils/auth-helpers.js';

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page, authHelpers }) => {
    // Clear any existing auth state
    await authHelpers.clearAuthState();
  });

  test('should successfully register a new user', async ({
    page,
    authHelpers,
  }) => {
    // Generate test user data
    const testUser = AuthHelpers.generateTestUser();

    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill and submit signup form
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to onboarding
    await authHelpers.expectOnboarding();

    // Verify user was created in database
    const userExists = await authHelpers.userExistsInDatabase(testUser.email);
    expect(userExists).toBe(true);
  });

  test('should show error for duplicate email registration', async ({
    page,
    authHelpers,
  }) => {
    // Create a test user first
    const testUser = AuthHelpers.generateTestUser();
    await authHelpers.createTestUser(testUser);

    // Navigate to signup page
    await authHelpers.goToSignup();

    // Try to register with same email
    await page.fill('input[name="fullName"]', 'Another User');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', 'DifferentPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await authHelpers.expectErrorMessage();

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should validate password confirmation mismatch', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form with mismatched passwords
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    // Should show validation error
    await authHelpers.expectFormValidationError('confirmPassword');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should validate required full name field', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form without full name
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show validation error for full name
    await authHelpers.expectFormValidationError('fullName');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should validate required email field', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form without email
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show validation error for email
    await authHelpers.expectFormValidationError('email');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should validate required password field', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form without password
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show validation error for password
    await authHelpers.expectFormValidationError('password');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should validate email format', async ({ page, authHelpers }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form with invalid email format
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', 'invalid-email-format');
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show validation error for email format
    await authHelpers.expectFormValidationError('email');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should handle empty form submission', async ({ page, authHelpers }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors for all required fields
    await authHelpers.expectFormValidationError('fullName');
    await authHelpers.expectFormValidationError('email');
    await authHelpers.expectFormValidationError('password');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should show/hide password visibility toggle', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Check if password field is initially hidden
    const passwordField = page.locator('input[name="password"]');
    await expect(passwordField).toHaveAttribute('type', 'password');

    // Look for password visibility toggle button
    const toggleButton = page.locator(
      'button[aria-label*="password"], button:has([data-testid="eye"]), .password-toggle'
    );

    if (await toggleButton.isVisible()) {
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordField).toHaveAttribute('type', 'text');

      // Click toggle again to hide password
      await toggleButton.click();
      await expect(passwordField).toHaveAttribute('type', 'password');
    }
  });

  test('should show loading state during registration', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);

    // Submit form and check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check if button shows loading state
    await expect(submitButton).toBeDisabled();

    // Wait for registration to complete
    await authHelpers.expectOnboarding();
  });

  test('should navigate to login page from signup page', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Click on login link
    await page.click(
      'a[href="/sign-in"], button:has-text("Sign in"), a:has-text("Login")'
    );

    // Should navigate to login page
    await authHelpers.expectOnLoginPage();
  });

  test('should handle network errors gracefully', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Mock network failure
    await page.route('**/api/**', (route) => route.abort());

    // Fill and submit form
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show error message or handle gracefully
    await authHelpers.expectErrorMessage();

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should validate minimum password length', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to signup page
    await authHelpers.goToSignup();

    // Fill form with short password
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', '123'); // Too short
    await page.fill('input[name="confirmPassword"]', '123');
    await page.click('button[type="submit"]');

    // Should show validation error for password strength
    await authHelpers.expectFormValidationError('password');

    // Should remain on signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should create user account in database with correct data', async ({
    page,
    authHelpers,
  }) => {
    // Generate test user data
    const testUser = AuthHelpers.generateTestUser();

    // Navigate to signup page and register
    await authHelpers.goToSignup();
    await page.fill('input[name="fullName"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await authHelpers.expectOnboarding();

    // Verify user data in database
    const dbUser = await authHelpers.getUserFromDatabase(testUser.email);
    expect(dbUser).toBeTruthy();
    expect(dbUser?.name).toBe(testUser.name);
    expect(dbUser?.email).toBe(testUser.email);
    expect(dbUser?.emailVerified).toBe(true); // Assuming email verification is disabled for tests
  });

  test('should redirect already logged in user to dashboard', async ({
    page,
    authHelpers,
  }) => {
    // Login with test user first
    const testUser = await authHelpers.loginAsTestUser();

    // Verify logged in
    await authHelpers.expectLoggedIn();

    // Try to navigate to signup page
    await page.goto('/sign-up');

    // Should redirect back to dashboard
    await authHelpers.expectLoggedIn();
  });
});
