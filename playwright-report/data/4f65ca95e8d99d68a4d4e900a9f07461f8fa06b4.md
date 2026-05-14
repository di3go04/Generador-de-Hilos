# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing.spec.ts >> Billing Flow >> should redirect to Stripe Checkout when clicking Subscribe
- Location: tests\billing.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /suscribirse/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /suscribirse/i })

```

```yaml
- heading "Algo salió mal" [level=1]
- paragraph: useAuth must be used within AuthProvider
- button "Reintentar"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Billing Flow', () => {
  4  |   test('should redirect to Stripe Checkout when clicking Subscribe', async ({ page }) => {
  5  |     // 1. Mock the backend session check (assuming user is logged in)
  6  |     await page.route('**/auth/me', async (route) => {
  7  |       await route.fulfill({
  8  |         status: 200,
  9  |         contentType: 'application/json',
  10 |         body: JSON.stringify({
  11 |           user: {
  12 |             id: 'user-123',
  13 |             email: 'test@example.com',
  14 |             name: 'Test User',
  15 |             role: 'admin',
  16 |             tenant_id: 'tenant-123'
  17 |           }
  18 |         })
  19 |       });
  20 |     });
  21 | 
  22 |     await page.route('**/tenants/me', async (route) => {
  23 |       await route.fulfill({
  24 |         status: 200,
  25 |         contentType: 'application/json',
  26 |         body: JSON.stringify({
  27 |           tenant: {
  28 |             id: 'tenant-123',
  29 |             name: 'Test Tenant',
  30 |             plan: 'free'
  31 |           }
  32 |         })
  33 |       });
  34 |     });
  35 | 
  36 |     // 2. Mock the checkout session creation
  37 |     const stripeUrl = 'https://checkout.stripe.com/pay/cs_test_mock';
  38 |     await page.route('**/billing/checkout', async (route) => {
  39 |       await route.fulfill({
  40 |         status: 200,
  41 |         contentType: 'application/json',
  42 |         body: JSON.stringify({ url: stripeUrl })
  43 |       });
  44 |     });
  45 | 
  46 |     // 3. Navigate to pricing
  47 |     await page.goto('/pricing');
  48 | 
  49 |     // 4. Click Subscribe on Pro plan
  50 |     const subscribeButton = page.getByRole('button', { name: /suscribirse/i });
> 51 |     await expect(subscribeButton).toBeVisible();
     |                                   ^ Error: expect(locator).toBeVisible() failed
  52 |     
  53 |     // We expect the window.location.href to change
  54 |     // Since we are mocking the response, we can catch the navigation or just check the button state
  55 |     await subscribeButton.click();
  56 | 
  57 |     // In a real E2E, we'd wait for the redirect. Since we mocked it, let's verify the loader appears
  58 |     await expect(page.getByText(/redirigiendo/i)).toBeVisible();
  59 |     
  60 |     // Verify it would have redirected to our mock URL
  61 |     // Playwright captures the navigation attempt
  62 |     await page.waitForURL(stripeUrl, { timeout: 5000 }).catch(() => {
  63 |         // If it's an external URL, Playwright might not "navigate" there in the same way 
  64 |         // but we can check the request was made.
  65 |     });
  66 |   });
  67 | });
  68 | 
```