import { Page, test as base } from '@playwright/test';
import { testDb } from './database.js';
import { AuthHelpers } from './auth-helpers.js';

// Extend Playwright test with custom fixtures
export const test = base.extend<{
  authHelpers: AuthHelpers;
  cleanDb: void;
}>({
  // Auth helpers fixture
  authHelpers: async ({ page }, use) => {
    const authHelpers = new AuthHelpers(page);
    await use(authHelpers);
  },

  // Database cleanup fixture
  cleanDb: [
    async ({}, use) => {
      // Wait for database initialization (with timeout)
      try {
        await testDb.waitForInitialization(10000); // 10 second timeout
      } catch (error) {
        console.log(
          'Database initialization failed, skipping cleanup:',
          error.message
        );
        await use();
        return;
      }

      const prisma = testDb.getPrismaClient();

      // Setup: Clean database before test
      try {
        await prisma.session.deleteMany();
        await prisma.account.deleteMany();
        await prisma.verification.deleteMany();
        await prisma.user.deleteMany();
      } catch (error) {
        console.log('Failed to clean database before test:', error.message);
      }

      // Run the test
      await use();

      // Teardown: Clean database after test
      try {
        await prisma.session.deleteMany();
        await prisma.account.deleteMany();
        await prisma.verification.deleteMany();
        await prisma.user.deleteMany();
      } catch (error) {
        console.log('Failed to clean database after test:', error.message);
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';

/**
 * Utility function to wait for network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Utility function to take a screenshot with a custom name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Utility function to wait for element with custom timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
) {
  return await page.waitForSelector(selector, { timeout });
}

/**
 * Utility function to check if element exists without waiting
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = await page.$(selector);
    return !!element;
  } catch {
    return false;
  }
}

/**
 * Utility function to fill form fields with error handling
 */
export async function fillFormField(
  page: Page,
  selector: string,
  value: string
) {
  await page.waitForSelector(selector);
  await page.fill(selector, value);

  // Verify the field was filled
  const filledValue = await page.inputValue(selector);
  if (filledValue !== value) {
    throw new Error(
      `Failed to fill field ${selector}. Expected: ${value}, Got: ${filledValue}`
    );
  }
}

/**
 * Utility function to click button with loading state handling
 */
export async function clickButton(page: Page, selector: string) {
  await page.waitForSelector(selector);
  await page.click(selector);

  // Wait for any loading states to complete
  await page.waitForFunction(
    (sel) => {
      const button = document.querySelector(sel);
      return (
        button &&
        !button.hasAttribute('disabled') &&
        !button.classList.contains('loading')
      );
    },
    selector,
    { timeout: 10000 }
  );
}

/**
 * Utility function to handle form submission with loading states
 */
export async function submitForm(page: Page, formSelector = 'form') {
  const submitButton = page.locator(`${formSelector} button[type="submit"]`);
  await submitButton.click();

  // Wait for form submission to complete
  await page.waitForFunction(
    (sel) => {
      const form = document.querySelector(sel);
      const submitBtn = form?.querySelector('button[type="submit"]');
      return (
        submitBtn &&
        !submitBtn.hasAttribute('disabled') &&
        !submitBtn.classList.contains('loading')
      );
    },
    formSelector,
    { timeout: 15000 }
  );
}

/**
 * Utility function to wait for URL change
 */
export async function waitForUrlChange(
  page: Page,
  expectedUrl: string | RegExp,
  timeout = 10000
) {
  await page.waitForURL(expectedUrl, { timeout });
}

/**
 * Utility function to check console errors
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Utility function to mock API responses
 */
export async function mockApiResponse(
  page: Page,
  url: string | RegExp,
  response: any
) {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Utility function to intercept and verify API calls
 */
export async function interceptApiCall(
  page: Page,
  url: string | RegExp
): Promise<any> {
  return new Promise((resolve) => {
    page.route(url, async (route) => {
      const request = route.request();
      const response = await route.fetch();
      const body = await response.json();

      resolve({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
        response: body,
      });

      await route.continue();
    });
  });
}
