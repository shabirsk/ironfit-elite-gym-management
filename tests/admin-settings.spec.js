import { test, expect } from '@playwright/test';

test.describe.serial('Admin Settings Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('View Razorpay Settings', async ({ page }) => {
    await page.goto('/admin/settings/razorpay');
    await page.waitForSelector('h1:has-text("Razorpay Settings")');

    await expect(page.locator('text=Razorpay Integration is Active')).toBeVisible();
    await expect(page.locator('text=Configured via RAZORPAY_KEY_ID')).toBeVisible();
    await expect(page.locator('button:has-text("Settings Managed via ENV")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings Managed via ENV")')).toBeDisabled();
  });

  test('View SMTP Settings', async ({ page }) => {
    await page.goto('/admin/settings/smtp');
    await page.waitForSelector('h1:has-text("SMTP Settings")');

    await expect(page.locator('input[value="smtp.hostinger.com (ENV: SMTP_HOST)"]')).toBeVisible();
    await expect(page.locator('button:has-text("Settings Managed via ENV")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings Managed via ENV")')).toBeDisabled();
  });

  test('View WhatsApp Settings', async ({ page }) => {
    await page.goto('/admin/settings/whatsapp');
    await page.waitForSelector('h1:has-text("WhatsApp API Settings")');

    await expect(page.locator('text=WhatsApp Integration is')).toBeVisible();
    await expect(page.locator('input[value="Configured via TWILIO_ACCOUNT_SID in .env"]')).toBeVisible();
    await expect(page.locator('button:has-text("Settings Managed via ENV")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings Managed via ENV")')).toBeDisabled();
  });
});
