import { expect, test } from '@playwright/test';

type Todo = {
  _id: string;
  title: string;
  completed: boolean;
};

test.describe('Todos UI (mock backend)', () => {

  test('can add, complete, edit and delete a todo', async ({ page }) => {
    const todos: Todo[] = [];
    let nextId = 1;

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
      const request = route.request();
      const method = request.method();
      const url = request.url();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(todos),
        });
        return;
      }

      if (method === 'POST') {
        const body = request.postDataJSON() as { title?: string };
        const title = body.title?.trim() ?? '';

        if (!title) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Title is required' }),
          });
          return;
        }

        const created: Todo = {
          _id: String(nextId++),
          title,
          completed: false,
        };
        todos.push(created);

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
        return;
      }

      if (method === 'PATCH') {
        const id = url.split('/').pop();
        const body = request.postDataJSON() as {
          completed?: boolean;
          title?: string;
        };
        const todo = todos.find((item) => item._id === id);

        if (!todo) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Not found' }),
          });
          return;
        }

        if (typeof body.completed === 'boolean') {
          todo.completed = body.completed;
        }

        if (typeof body.title === 'string' && body.title.trim()) {
          todo.title = body.title.trim();
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(todo),
        });
        return;
      }

      if (method === 'DELETE') {
        const id = url.split('/').pop();
        const index = todos.findIndex((item) => item._id === id);
        if (index !== -1) {
          todos.splice(index, 1);
        }

        await route.fulfill({ status: 200, body: '' });
        return;
      }

      await route.fallback();
    });

    await page.goto('/login');
    await page.getByLabel('Email:').fill('mock@example.com');
    await page.locator('input[type="password"]').first().fill('secret123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/\/todos$/);
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
    await page.screenshot({
      path: 'e2e-screenshots/mock/todos-login-success.png',
      fullPage: true,
    });

    const todoTitle = 'Playwright todo item';
    await page.getByPlaceholder('Add new todo').fill(todoTitle);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText(todoTitle, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/todos-after-add.png',
      fullPage: true,
    });

    const todoRow = page
      .locator('div', { has: page.getByText(todoTitle, { exact: true }) })
      .first();
    await todoRow.locator('input[type="checkbox"]').click({ force: true });
    await expect(todoRow.locator('span', { hasText: todoTitle })).toHaveCSS(
      'text-decoration-line',
      'line-through',
    );
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/todos-after-complete.png',
      fullPage: true,
    });

    const editedTitle = 'Playwright todo updated';
    await page.getByText(todoTitle, { exact: true }).click();
    const editInput = page.locator(`input[value="${todoTitle}"]`);
    await expect(editInput).toBeVisible();
    await editInput.fill(editedTitle);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(editedTitle, { exact: true })).toBeVisible();
    await expect(page.getByText(todoTitle, { exact: true })).toHaveCount(0);
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/todos-after-edit.png',
      fullPage: true,
    });

    page.once('dialog', (dialog) => dialog.accept());
    const editedRow = page
      .locator('div', { has: page.getByText(editedTitle, { exact: true }) })
      .first();
    await editedRow.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(editedTitle, { exact: true })).toHaveCount(0);
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'e2e-screenshots/mock/todos-crud-complete.png',
      fullPage: true,
    });
  });
});
