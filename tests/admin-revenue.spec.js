import { test, expect } from '@playwright/test';

test.describe('Admin Revenue Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('View Revenue Dashboard Tabs', async ({ page }) => {
    await page.goto('/admin/revenue');
    await page.waitForSelector('h1:has-text("Revenue & Financials")');

    // 1. Overview Tab
    await expect(page.locator('text=Total Revenue').first()).toBeVisible();
    await expect(page.locator('text=Today\'s Collections').first()).toBeVisible();
    await expect(page.locator('text=Revenue by Month').first()).toBeVisible();
    await expect(page.locator('text=Revenue by Plan').first()).toBeVisible();
    await expect(page.locator('text=Revenue by Method').first()).toBeVisible();

    // 2. Renewals Tab
    await page.click('button:has-text("Renewals")');
    await expect(page.locator('text=Active Subscriptions').first()).toBeVisible();
    await expect(page.locator('text=Expiring in 7 Days').first()).toBeVisible();
    await expect(page.locator('text=Expiring in 30 Days').first()).toBeVisible();
    await expect(page.locator('text=Expired Subscriptions').first()).toBeVisible();

    // 3. Reports Tab
    await page.click('button:has-text("Reports")');
    await expect(page.locator('text=Select Year:').first()).toBeVisible();
    await expect(page.locator('text=Status Breakdown').first()).toBeVisible();
    await expect(page.locator('text=Monthly Totals').first()).toBeVisible();
  });
});
