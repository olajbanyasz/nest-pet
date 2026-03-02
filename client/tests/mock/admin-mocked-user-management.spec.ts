import { expect, test } from '@playwright/test';

type BackendUser = {
  _id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
  lastLoginAt?: string;
  todoCount?: number;
};

test.describe('Admin User Management (mock backend)', () => {
  test('admin can filter, promote, demote and delete users', async ({ page }) => {
    const users: BackendUser[] = [
      {
        _id: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Admin User',
        lastLoginAt: '2026-02-20T10:00:00.000Z',
        todoCount: 5,
      },
      {
        _id: 'user-1',
        email: 'member@example.com',
        role: 'USER',
        name: 'Member User',
        lastLoginAt: '2026-02-19T08:30:00.000Z',
        todoCount: 2,
      },
      {
        _id: 'user-2',
        email: 'viewer@example.com',
        role: 'USER',
        name: 'Viewer User',
        lastLoginAt: '2026-02-18T07:15:00.000Z',
        todoCount: 1,
      },
    ];

    let promoteCalls = 0;
    let demoteCalls = 0;
    let deleteCalls = 0;

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

    await page.route('**/api/todos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/admin/users**', async (route) => {
      const request = route.request();
      const method = request.method();
      const url = new URL(request.url());
      const pathname = url.pathname;

      if (method === 'GET') {
        const emailFilter = url.searchParams.get('email');
        const filtered = emailFilter
          ? users.filter((user) => user.email.includes(emailFilter))
          : users;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(filtered),
        });
        return;
      }

      if (method === 'PATCH' && pathname.endsWith('/promote')) {
        const id = pathname.split('/').slice(-2, -1)[0];
        const target = users.find((user) => user._id === id);

        if (!target) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Not found' }),
          });
          return;
        }

        target.role = 'ADMIN';
        promoteCalls += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(target),
        });
        return;
      }

      if (method === 'PATCH' && pathname.endsWith('/demote')) {
        const id = pathname.split('/').slice(-2, -1)[0];
        const target = users.find((user) => user._id === id);

        if (!target) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Not found' }),
          });
          return;
        }

        target.role = 'USER';
        demoteCalls += 1;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(target),
        });
        return;
      }

      if (method === 'DELETE') {
        const id = pathname.split('/').pop() ?? '';
        const index = users.findIndex((user) => user._id === id);

        if (index !== -1) {
          users.splice(index, 1);
        }

        deleteCalls += 1;
        await route.fulfill({ status: 200, body: '' });
        return;
      }

      await route.fallback();
    });

    await page.goto('/login');
    await page.getByLabel('Email:').fill('admin@example.com');
    await page.locator('input[type="password"]').first().fill('secret123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/todos$/);

    await page.getByText('User Management', { exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Admin panel' })).toBeVisible();
    await expect(page.getByText('admin@example.com')).toBeVisible();
    await expect(page.getByText('member@example.com')).toBeVisible();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/user-management.png',
      fullPage: true,
    });

    const memberRow = page
      .getByText('member@example.com', { exact: true })
      .locator('xpath=ancestor::div[contains(@style,"border-bottom")][1]');
    const memberRoleCheckbox = memberRow.getByRole('checkbox');

    await memberRoleCheckbox.click({ force: true });
    await expect.poll(() => promoteCalls).toBe(1);

    await memberRoleCheckbox.click({ force: true });
    await expect.poll(() => demoteCalls).toBe(1);

    const filterInput = page.getByPlaceholder('Filter users by email');
    await filterInput.fill('member@');

    await expect(page.getByText('member@example.com')).toBeVisible();
    await expect(page.getByText('viewer@example.com')).toHaveCount(0);
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/users-filtered.png',
      fullPage: true,
    });

    await filterInput.fill('');
    await expect(page.getByText('viewer@example.com')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await memberRow.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/user-deleted.png',
      fullPage: true,
    });

    await expect.poll(() => deleteCalls).toBe(1);
    await expect(page.getByText('member@example.com')).toHaveCount(0);
  });
});

