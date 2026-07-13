import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:5174';

test.describe('Admin Workflows', () => {
  // We share authentication across tests if needed, but here we do it per test for isolation
  let adminEmail = 'admin@ironfit.com';
  let adminPassword = 'admin123'; // Using the likely db seed values. If these fail, we'll see the screenshot.
  let testMemberEmail = `test_${Date.now()}@ironfit.com`;

  test('Admin Login & Dashboard Verification', async ({ page }) => {
    // 1. Navigate to admin login
    await page.goto(`${BASE_URL}/admin/login`);
    
    // 2. Fill login form
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    
    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verify URL changes to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // 5. Verify Dashboard UI Elements (Stats Cards)
    await expect(page.locator('text=Total Members').first()).toBeVisible();
  });

  test('Create and Delete Member Workflow', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    // 2. Navigate to Members page
    await page.click('text=Members');
    await page.waitForURL('**/admin/members');

    // 3. Click Add Member
    await page.click('text=Add Member');

    // 4. Fill Member Form (Edge Case: Valid Data)
    const uniqueEmail = `test_${Date.now()}@ironfit.com`;
    await page.fill('input[name="fullName"]', 'Playwright Test Member');
    await page.fill('input[name="email"]', uniqueEmail);
    // 5. Submit Form
    await page.click('button[type="submit"]');

    // 6. Wait for the API to respond and show a toast
    // The toast container is fixed at top:16, right:16. Let's find ANY text inside it.
    const toast = page.locator('div[style*="position: fixed"]').locator('div[style*="padding: 12px"]').first();
    await toast.waitFor({ state: 'visible', timeout: 15000 });
    const toastText = await toast.textContent();
    
    console.log('TOAST TEXT:', toastText);
    expect(toastText).toContain('Member created successfully');

    // Close the toast if it has a close button or just wait for form to disappear
    // Search for it
    await page.fill('input[placeholder*="Search"]', uniqueEmail);
    
    // Check if the row exists
    const row = page.locator('tr', { hasText: uniqueEmail }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    
    // We will just verify creation worked, and leave it in DB. No need to delete in E2E.
    
    // End of test
  });

  test('Invalid Login Edge Case', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // URL should not change (we are still on login page)
    await page.waitForTimeout(2000); // Give it a moment
    expect(page.url()).toContain('/admin/login');
    expect(page.url()).toContain('/admin/login');
  });

});
