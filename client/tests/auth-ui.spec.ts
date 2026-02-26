import { expect, test } from '@playwright/test';

test.describe('Auth UI', () => {
  test('shows login form on first load', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email:')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.screenshot({
      path: 'e2e-screenshots/login-form.png',
      fullPage: true,
    });
  });

  test('can switch from login to register and show name field', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Switch to Register' }).click();

    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
    await expect(page.getByLabel('Name:')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Switch to Login' }),
    ).toBeVisible();
    await page.screenshot({
      path: 'e2e-screenshots/register-form.png',
      fullPage: true,
    });
  });
});
