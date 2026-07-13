import { test, expect } from '@playwright/test';

test.describe('Member Authentication & Dashboard', () => {
  test('Member Login', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    await page.goto('/member/login');
    // Assuming member login is just /member/login
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('**/member/dashboard');
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });
});
