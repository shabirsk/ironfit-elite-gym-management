import { test, expect } from '@playwright/test';

test.describe('Admin Plans Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
    
    // Navigate to Plans
    await page.goto('/admin/plans');
    await page.waitForSelector('h1:has-text("Pricing Plans")');
  });

  const generateRandomPlanName = () => `Test Plan ${Date.now()}`;

  test('Create Plan Success', async ({ page }) => {
    const planName = generateRandomPlanName();
    
    await page.click('button:has-text("New Plan")');
    await expect(page.locator('h2:has-text("New Plan")')).toBeVisible();

    await page.fill('input[name="planName"]', planName);
    await page.fill('input[name="price"]', '99.99');
    await page.fill('input[name="duration"]', '30');
    await page.fill('textarea[name="features"]', 'Feature 1\nFeature 2');
    
    await page.click('button:has-text("Create Plan")');

    // Wait for success toast
    const toast = page.getByText(/Plan created successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('h2:has-text("New Plan")')).not.toBeVisible();
    
    // Verify plan is in the list (as a card)
    await expect(page.locator(`.saas-card:has-text("${planName}")`).first()).toBeVisible();
  });

  test('Edit Plan', async ({ page }) => {
    const planName = generateRandomPlanName();
    
    // Create
    await page.click('button:has-text("New Plan")');
    await page.fill('input[name="planName"]', planName);
    await page.fill('input[name="price"]', '50');
    await page.fill('input[name="duration"]', '15');
    await page.click('button:has-text("Create Plan")');
    await page.waitForTimeout(1000);

    // Find the card containing our plan name, then click the Edit button
    const card = page.locator('.saas-card').filter({ hasText: planName });
    await card.locator('button').first().click();
    
    // Modal appears
    await expect(page.locator('h2:has-text("Edit Plan")')).toBeVisible();

    // Modify name
    const editedName = `${planName} Edited`;
    await page.fill('input[name="planName"]', editedName);
    await page.click('button:has-text("Save Changes")');

    // Wait for success toast
    const toast = page.getByText(/Plan updated successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify change
    await expect(page.locator(`.saas-card:has-text("${editedName}")`).first()).toBeVisible();
  });

  test('Delete Plan', async ({ page }) => {
    const planName = generateRandomPlanName();
    
    // Create
    await page.click('button:has-text("New Plan")');
    await page.fill('input[name="planName"]', planName);
    await page.fill('input[name="price"]', '10');
    await page.fill('input[name="duration"]', '7');
    await page.click('button:has-text("Create Plan")');
    await page.waitForTimeout(1000);

    // Delete
    const card = page.locator('.saas-card').filter({ hasText: planName });
    // Confirm deletion modal if any (browser confirm)
    page.on('dialog', dialog => dialog.accept());
    await card.locator('button').nth(1).click();

    // Wait for success
    const toast = page.getByText(/Plan deleted/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify card is gone
    await expect(page.locator(`.saas-card:has-text("${planName}")`)).not.toBeVisible();
  });
});
