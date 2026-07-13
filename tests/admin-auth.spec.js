import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & Core', () => {

  test('Successful Login and Logout', async ({ page }) => {
    // Navigate to Admin Login
    await page.goto('/admin/login');
    await expect(page).toHaveTitle(/IronFit/);

    // Login with valid credentials
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for Dashboard to load
    await page.waitForURL('/admin/dashboard');
    await expect(page.locator('h1').filter({ hasText: 'Overview' })).toBeVisible();

    // Verify Stats are loaded
    await expect(page.locator('text=Total Members')).toBeVisible();

    // Logout
    await page.locator('.profile-dropdown').click();
    await page.click('button:has-text("Sign out")');
    await page.waitForURL('**/admin/login');
    
    // Verify LocalStorage is cleared (token removed)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('Invalid Login Edge Case', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Invalid credentials
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for inline error box
    const errorBox = page.locator('.login-error-box');
    await errorBox.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Empty Form Submission', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Click submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Check HTML5 validation or explicit error
    // Just verify we are still on the login page.
    await expect(page).toHaveURL('/admin/login');
  });

  test('Unauthorized Access Redirection (No JWT)', async ({ page }) => {
    // Attempt to access dashboard directly without logging in
    await page.goto('/admin/dashboard');
    
    // Should be redirected back to login
    await page.waitForURL('/admin/login');
    await expect(page).toHaveURL('/admin/login');
  });

  test('Expired/Invalid JWT Handling', async ({ page }) => {
    await page.goto('/admin/login');
    // Set a fake invalid token
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
      localStorage.setItem('user', JSON.stringify({ role: 'admin', fullName: 'Admin' }));
    });
    
    // Try to access dashboard
    await page.goto('/admin/dashboard');
    
    // The API calls on the dashboard should fail with 401, which triggers our axios interceptor to log out.
    // We should be redirected back to login and localstorage cleared
    await page.waitForURL('**/admin/login');
    await page.waitForSelector('input[type="email"]');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

});
