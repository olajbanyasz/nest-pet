import { expect, test } from '@playwright/test';

test.describe('Auth UI (real backend smoke)', () => {
  test('backend csrf endpoint is reachable and login page renders', async ({
    page,
  }) => {
    const csrfResponse = await page.request.get(
      'http://127.0.0.1:8000/api/auth/csrf-token',
    );

    expect(csrfResponse.ok()).toBeTruthy();
    const csrfPayload = (await csrfResponse.json()) as { csrfToken?: string };
    expect(csrfPayload.csrfToken).toBeTruthy();

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await page.screenshot({
      path: 'e2e-screenshots/real/login-page.png',
      fullPage: true,
    });
  });
});
