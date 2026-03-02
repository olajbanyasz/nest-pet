import { expect, test } from '@playwright/test';

const setupAdminAuthMocks = async (page: import('@playwright/test').Page) => {
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
        access_token: 'mock-admin-token',
        user: {
          userId: 'admin-1',
          email: 'admin@example.com',
          role: 'ADMIN',
          name: 'Admin User',
        },
      }),
    });
  });

  await page.route('**/api/todos/stats/last-14-days', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        createdTodos: {
          '2026-02-13': 0,
          '2026-02-14': 1,
          '2026-02-15': 3,
          '2026-02-16': 2,
          '2026-02-17': 0,
          '2026-02-18': 4,
          '2026-02-19': 1,
          '2026-02-20': 0,
          '2026-02-21': 2,
          '2026-02-22': 5,
          '2026-02-23': 0,
          '2026-02-24': 1,
          '2026-02-25': 2,
          '2026-02-26': 3,
        },
        completedTodos: {
          '2026-02-13': 0,
          '2026-02-14': 0,
          '2026-02-15': 2,
          '2026-02-16': 1,
          '2026-02-17': 0,
          '2026-02-18': 2,
          '2026-02-19': 1,
          '2026-02-20': 0,
          '2026-02-21': 1,
          '2026-02-22': 3,
          '2026-02-23': 0,
          '2026-02-24': 1,
          '2026-02-25': 1,
          '2026-02-26': 2,
        },
        deletedTodos: {
          '2026-02-13': 0,
          '2026-02-14': 0,
          '2026-02-15': 1,
          '2026-02-16': 0,
          '2026-02-17': 0,
          '2026-02-18': 1,
          '2026-02-19': 0,
          '2026-02-20': 0,
          '2026-02-21': 0,
          '2026-02-22': 1,
          '2026-02-23': 0,
          '2026-02-24': 0,
          '2026-02-25': 1,
          '2026-02-26': 0,
        },
      }),
    });
  });

  await page.route('**/api/admin/details', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalUsers: 17,
        totalAdmins: 3,
        totalTodos: 44,
        totalCompletedTodos: 18,
        totalActiveTodos: 21,
        totalDeletedTodos: 5,
      }),
    });
  });

  await page.route('**/api/todos**', async (route) => {
    const url = route.request().url();
    if (url.includes('/api/todos/stats/last-14-days')) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
};

test.describe('Dashboard UI (mock backend)', () => {
  test('admin can navigate dashboard tabs and see stats data', async ({ page }) => {
    await setupAdminAuthMocks(page);

    await page.goto('/login');
    await page.getByLabel('Email:').fill('admin@example.com');
    await page.locator('input[type="password"]').first().fill('secret123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/todos$/);

    await page.getByText('Dashboard', { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    const appStatTab = page.getByRole('tab', {
      name: 'Application Stat',
      exact: true,
    });
    const todosStatTab = page.getByRole('tab', {
      name: 'Todos Stat',
      exact: true,
    });
    const recentTab = page.getByRole('tab', {
      name: 'Recent Todos Stat',
      exact: true,
    });

    await expect(appStatTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Total Users:')).toBeVisible();
    await expect(page.getByText('17')).toBeVisible();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/dashboard-app-stat.png',
      fullPage: true,
    });

    await todosStatTab.click();
    await expect(todosStatTab).toHaveAttribute('aria-selected', 'true');
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/dashboard-todos-stat.png',
      fullPage: true,
    });

    await recentTab.click();
    await expect(recentTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Todos last 14 days' })).toBeVisible();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/dashboard-recent-todos-stat.png',
      fullPage: true,
    });
  });

  test('can open and close online users modal', async ({ page }) => {
    await setupAdminAuthMocks(page);

    await page.goto('/login');
    await page.getByLabel('Email:').fill('admin@example.com');
    await page.locator('input[type="password"]').first().fill('secret123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/todos$/);

    await page.getByText('Dashboard', { exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole('button', { name: /Show Online Users/i }).click();
    await expect(page.getByRole('dialog', { name: 'Online Users' })).toBeVisible();
    await expect(page.getByText('No online user.')).toBeVisible();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/dashboard-online-users-modal.png',
      fullPage: true,
    });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Online Users' })).toBeHidden();
  });
});
