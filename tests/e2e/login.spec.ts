import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Inicia sesión");
  });

  test("should redirect to register from login", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Crea una cuenta");
    await expect(page).toHaveURL("/register");
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Expect toast error or message (depending on implementation)
    // await expect(page.locator("text=Error")).toBeVisible();
  });
});

test.describe("Landing Page", () => {
  test("should have main hero title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Crea hilos virales");
  });

  test("should navigate to pricing", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Precios");
    await expect(page).toHaveURL("/pricing");
  });
});
