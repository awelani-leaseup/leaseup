import { Page, expect } from '@playwright/test';
import { testDb } from './database.js';
import { nanoid } from 'nanoid';

export interface TestUser {
  id?: string;
  name: string;
  email: string;
  password: string;
}

export class AuthHelpers {
  constructor(private readonly page: Page) {}

  /**
   * Generate a unique test user with random email
   */
  static generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
    const id = nanoid(8);
    return {
      name: `Test User ${id}`,
      email: `test.user.${id}@example.com`,
      password: 'TestPassword123!',
      ...overrides,
    };
  }

  /**
   * Create a test user in the database
   */
  async createTestUser(userData: TestUser) {
    // Wait for database initialization before creating user
    await testDb.waitForInitialization(10000);

    return await testDb.createTestUser({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      emailVerified: true,
    });
  }

  /**
   * Navigate to the login page
   */
  async goToLogin() {
    await this.page.goto('/sign-in');
    await expect(this.page).toHaveURL('/sign-in');
  }

  /**
   * Navigate to the signup page
   */
  async goToSignup() {
    await this.page.goto('/sign-up');
    await expect(this.page).toHaveURL('/sign-up');
  }

  /**
   * Fill and submit the login form
   */
  async login(email: string, password: string) {
    await this.goToLogin();

    // Fill login form
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);

    // Submit form
    await this.page.click('button[type="submit"]');
  }

  /**
   * Fill and submit the signup form
   */
  async signup(userData: TestUser) {
    await this.goToSignup();

    // Fill signup form
    await this.page.fill('input[name="fullName"]', userData.name);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="confirmPassword"]', userData.password);

    // Submit form
    await this.page.click('button[type="submit"]');
  }

  /**
   * Login with a test user (creates user if not exists)
   */
  async loginAsTestUser(userData?: TestUser) {
    const user = userData || AuthHelpers.generateTestUser();

    // Create user in database
    await this.createTestUser(user);

    // Login through UI
    await this.login(user.email, user.password);

    return user;
  }

  /**
   * Check if user is logged in by verifying redirect to dashboard
   */
  async expectLoggedIn() {
    await expect(this.page).toHaveURL('/dashboard');
    // Wait for dashboard to load
    await this.page.waitForSelector('[data-testid="dashboard"]', {
      timeout: 10000,
    });
  }

  /**
   * Check if user is redirected to onboarding
   */
  async expectOnboarding() {
    await expect(this.page).toHaveURL('/onboarding');
    // Wait for onboarding to load
    await this.page.waitForSelector('[data-testid="onboarding"]', {
      timeout: 10000,
    });
  }

  /**
   * Check if user is on login page
   */
  async expectOnLoginPage() {
    await expect(this.page).toHaveURL('/sign-in');
  }

  /**
   * Check if user is on signup page
   */
  async expectOnSignupPage() {
    await expect(this.page).toHaveURL('/sign-up');
  }

  /**
   * Wait for and verify error message is displayed
   */
  async expectErrorMessage(message?: string) {
    const errorElement = this.page
      .locator('[data-testid="error-message"], .error, [role="alert"]')
      .first();
    await expect(errorElement).toBeVisible();

    if (message) {
      await expect(errorElement).toContainText(message);
    }
  }

  /**
   * Wait for and verify success message is displayed
   */
  async expectSuccessMessage(message?: string) {
    const successElement = this.page
      .locator('[data-testid="success-message"], .success')
      .first();
    await expect(successElement).toBeVisible();

    if (message) {
      await expect(successElement).toContainText(message);
    }
  }

  /**
   * Check form validation errors
   */
  async expectFormValidationError(fieldName: string, message?: string) {
    const errorElement = this.page
      .locator(
        `[data-testid="${fieldName}-error"], input[name="${fieldName}"] + .error`
      )
      .first();
    await expect(errorElement).toBeVisible();

    if (message) {
      await expect(errorElement).toContainText(message);
    }
  }

  /**
   * Logout user (if logout functionality exists)
   */
  async logout() {
    // Look for logout button/link
    const logoutButton = this.page
      .locator(
        '[data-testid="logout"], button:has-text("Logout"), a:has-text("Sign out")'
      )
      .first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Fallback: clear cookies and local storage
      await this.page.context().clearCookies();
      try {
        await this.page.evaluate(() => {
          if (typeof localStorage !== 'undefined') {
            localStorage.clear();
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
          }
        });
      } catch {
        // Ignore localStorage access errors - expected when page hasn't been navigated to yet
      }
    }
  }

  /**
   * Clear all authentication state
   */
  async clearAuthState() {
    await this.page.context().clearCookies();

    // Only try to clear localStorage/sessionStorage if we're on a valid page
    try {
      await this.page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      });
    } catch {
      // Ignore localStorage access errors (e.g., when page hasn't been navigated to yet)
      // This is expected when clearAuthState is called before any navigation
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user exists in database
   */
  async userExistsInDatabase(email: string) {
    await testDb.waitForInitialization(10000);
    const user = await testDb.getUserByEmail(email);
    return !!user;
  }

  /**
   * Get user from database
   */
  async getUserFromDatabase(email: string) {
    await testDb.waitForInitialization(10000);
    return await testDb.getUserByEmail(email);
  }
}
