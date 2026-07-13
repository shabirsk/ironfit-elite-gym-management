import { test, expect } from '@playwright/test';

test.describe('Admin Automations Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('View Automations Dashboard', async ({ page }) => {
    await page.goto('/admin/automations');
    await page.waitForSelector('h1:has-text("Automation Logs")');

    // Filter by System
    await page.click('button:has-text("System")');
    
    // Check if table or empty state appears
    const noLogs = page.locator('text=No automation logs found.');
    const table = page.locator('.saas-table');

    await Promise.any([
      expect(noLogs).toBeVisible(),
      expect(table).toBeVisible()
    ]);
  });
});
