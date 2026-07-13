import { test, expect } from '@playwright/test';

test.describe.serial('Admin Payments Management', () => {
  let testMemberName = '';

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Create Member for Payment Test', async ({ page }) => {
    testMemberName = `Pay Member ${Date.now()}`;
    const email = `pay_${Date.now()}@example.com`;
    
    await page.goto('/admin/members');
    await page.waitForSelector('.saas-table-container');
    await page.click('button:has-text("Add Member")');
    
    await page.fill('input[name="fullName"]', testMemberName);
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Member")');
    
    const toast = page.getByText(/Member created/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Record Manual Payment', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForSelector('h1:has-text("Payments")');

    await page.click('button:has-text("Record Payment")');
    await expect(page.locator('h2:has-text("Record Manual Payment")')).toBeVisible();

    // Select the member we just created
    await page.selectOption('select[required]', { label: testMemberName });
    
    await page.fill('input[type="number"]', '150');
    
    // The modal has a 'Record Payment' submit button
    await page.locator('button[type="submit"]:has-text("Record Payment")').click();

    // Wait for success
    const toast = page.getByText(/Payment recorded successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify in history
    await page.fill('input[placeholder*="Search"]', testMemberName);
    await expect(page.locator('table').locator(`text=${testMemberName}`).first()).toBeVisible();
    await expect(page.locator('table').locator('text=$150.00').first()).toBeVisible();
  });

  test('Search and Filter Payments', async ({ page }) => {
    await page.goto('/admin/payments');
    await page.waitForSelector('h1:has-text("Payments")');

    await page.fill('input[placeholder*="Search"]', 'NonExistentTransaction123');
    await page.waitForTimeout(1000);
    
    // Verify empty state
    await expect(page.locator('text=No transactions found')).toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(1000);
  });
});
