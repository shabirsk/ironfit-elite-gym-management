import { test, expect } from '@playwright/test';

test.describe.serial('Admin Attendance Management', () => {
  let testMemberName = '';

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Create Member for Attendance Test', async ({ page }) => {
    testMemberName = `Att Member ${Date.now()}`;
    const email = `att_${Date.now()}@example.com`;
    
    // Go to Members and create
    await page.goto('/admin/members');
    await page.waitForSelector('.saas-table-container');
    await page.click('button:has-text("Add Member")');
    
    await page.fill('input[name="fullName"]', testMemberName);
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Member")');
    
    const toast = page.getByText(/Member created/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Mark Attendance', async ({ page }) => {
    await page.goto('/admin/attendance');
    await page.waitForSelector('h1:has-text("Attendance")');

    // Select the member we just created
    await page.selectOption('select', { label: testMemberName });
    
    // Status is 'present' by default
    await page.click('button:has-text("Mark Present")');

    // Wait for success
    const toast = page.getByText(/Attendance marked successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify in history
    await expect(page.locator('table').locator(`text=${testMemberName}`).first()).toBeVisible();
  });

  test('View Monthly Report', async ({ page }) => {
    await page.goto('/admin/attendance');
    await page.waitForSelector('h1:has-text("Attendance")');

    await page.click('button:has-text("Monthly Report")');
    await expect(page.locator('h2:has-text("Attendance Report")')).toBeVisible();

    // Verify our marked member is in the report
    await expect(page.locator('table').first().locator('tr').filter({ hasText: testMemberName }).first()).toBeVisible();
  });
});
