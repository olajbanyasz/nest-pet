import { expect, test } from '@playwright/test';

test.describe('Auth UI (mock backend)', () => {
  test('logs in and navigates to todos with mocked API', async ({ page }) => {
    await page.route('**/api/auth/csrf-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ csrfToken: 'test-csrf-token' }),
      });
    });

    await page.route('**/api/auth/refresh', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          user: {
            userId: 'u-1',
            email: 'mock@example.com',
            role: 'USER',
            name: 'Mock User',
          },
        }),
      });
    });

    await page.route('**/api/todos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email:').fill('mock@example.com');
    await page.locator('input[type="password"]').first().fill('secret123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/todos$/);
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
    await page.screenshot({
      path: 'e2e-screenshots/mock/login-success.png',
      fullPage: true,
    });
  });
});
