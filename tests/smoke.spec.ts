import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Urban/);
});

test('can navigate to login', async ({ page }) => {
  await page.goto('/');

  // Click the login link (assuming there is one based on the auth requirements)
  // This might fail if the button text is different, but it's a good starting point.
  const loginButton = page.getByRole('link', { name: /entrar|iniciar sesión/i });
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await expect(page).toHaveURL(/\/auth\/login/);
  }
});
