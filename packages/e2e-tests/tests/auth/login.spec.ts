import { test, expect } from '@/utils/test-helpers.js';
import { AuthHelpers } from '@/utils/auth-helpers.js';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page, authHelpers }) => {
    await authHelpers.clearAuthState();
  });

  test('should successfully login with valid credentials', async ({
    page,
    authHelpers,
  }) => {
    const testUser = AuthHelpers.generateTestUser({
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
    });
    await authHelpers.createTestUser(testUser);

    await authHelpers.goToLogin();

    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await authHelpers.expectLoggedIn();

    await expect(
      page.locator('[data-testid="user-menu"], .user-profile')
    ).toBeVisible();
  });

  test('should show error for invalid password', async ({
    page,
    authHelpers,
  }) => {
    const testUser = AuthHelpers.generateTestUser();
    await authHelpers.createTestUser(testUser);

    await authHelpers.goToLogin();

    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    await authHelpers.expectErrorMessage();

    await authHelpers.expectOnLoginPage();
  });

  test('should show error for non-existent user', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Fill form with non-existent user
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await authHelpers.expectErrorMessage();

    // Should remain on login page
    await authHelpers.expectOnLoginPage();
  });

  test('should validate required email field', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Try to submit form without email
    await page.fill('input[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');

    // Should show validation error for email field
    await authHelpers.expectFormValidationError('email');

    // Should remain on login page
    await authHelpers.expectOnLoginPage();
  });

  test('should validate required password field', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Try to submit form without password
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Should show validation error for password field
    await authHelpers.expectFormValidationError('password');

    // Should remain on login page
    await authHelpers.expectOnLoginPage();
  });

  test('should validate email format', async ({ page, authHelpers }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Fill form with invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');

    // Should show validation error for email format
    await authHelpers.expectFormValidationError('email');

    // Should remain on login page
    await authHelpers.expectOnLoginPage();
  });

  test('should handle empty form submission', async ({ page, authHelpers }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors for both fields
    await authHelpers.expectFormValidationError('email');
    await authHelpers.expectFormValidationError('password');

    // Should remain on login page
    await authHelpers.expectOnLoginPage();
  });

  test('should persist login session across page reloads', async ({
    page,
    authHelpers,
  }) => {
    // Login with test user
    const testUser = await authHelpers.loginAsTestUser();

    // Verify logged in
    await authHelpers.expectLoggedIn();

    await page.reload();

    // Should still be logged in
    await authHelpers.expectLoggedIn();
  });

  test('should redirect already logged in user to dashboard', async ({
    page,
    authHelpers,
  }) => {
    // Login with test user
    const testUser = await authHelpers.loginAsTestUser();

    // Verify logged in
    await authHelpers.expectLoggedIn();

    // Try to navigate to login page
    await page.goto('/sign-in');

    // Should redirect back to dashboard
    await authHelpers.expectLoggedIn();
  });

  test('should show loading state during login', async ({
    page,
    authHelpers,
  }) => {
    // Create a test user
    const testUser = AuthHelpers.generateTestUser();
    await authHelpers.createTestUser(testUser);

    // Navigate to login page
    await authHelpers.goToLogin();

    // Fill form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Submit form and check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check if button shows loading state (disabled or loading text/spinner)
    await expect(submitButton).toBeDisabled();

    // Wait for login to complete
    await authHelpers.expectLoggedIn();
  });

  test('should navigate to signup page from login page', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Click on signup link
    await page.click(
      'a[href="/sign-up"], button:has-text("Sign up"), a:has-text("Create account")'
    );

    // Should navigate to signup page
    await authHelpers.expectOnSignupPage();
  });

  test('should handle network errors gracefully', async ({
    page,
    authHelpers,
  }) => {
    // Navigate to login page
    await authHelpers.goToLogin();

    // Mock network failure
    await page.route('**/api/**', (route) => route.abort());

    // Fill and submit form
    const testUser = AuthHelpers.generateTestUser();
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should show error message or handle gracefully
    await authHelpers.expectErrorMessage();

    // Should remain on login page
    await authHelpers.expectOnLoginPage();
  });
});
