import { test, expect } from '@playwright/test';

test.describe('Member Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/member/login');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/member/dashboard');
  });

  test('View and Edit Profile', async ({ page }) => {
    await page.goto('/member/profile');
    
    // Ensure profile page loaded
    await expect(page.locator('h1:has-text("My Profile")').or(page.locator('h1:has-text("Profile")'))).toBeVisible();

    // Verify some tabs or form fields are visible
    await expect(page.locator('input[name="fullName"]')).toBeVisible();

    // Wait for the form to populate
    await page.waitForTimeout(1000);

    // Edit Phone Number
    await page.fill('input[name="phone"]', '1234567890');
    
    // Save changes
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
        await saveButton.click();
        await expect(page.getByText(/Profile updated successfully/i).first()).toBeVisible({ timeout: 10000 });
    }
  });
});
