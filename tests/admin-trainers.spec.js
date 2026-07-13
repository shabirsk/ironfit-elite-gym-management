import { test, expect } from '@playwright/test';

test.describe('Admin Trainer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
    
    // Navigate to Trainers
    await page.goto('/admin/trainers');
    await page.waitForSelector('.saas-table-container');
  });

  const generateRandomEmail = () => `trainer_${Date.now()}@example.com`;

  test('Create Trainer Success', async ({ page }) => {
    const email = generateRandomEmail();
    
    await page.click('button:has-text("Add Trainer")');
    await expect(page.locator('h2:has-text("New Trainer")')).toBeVisible();

    await page.fill('input[name="fullName"]', 'Test Trainer');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="specialization"]', 'Yoga');
    await page.fill('input[name="experienceYears"]', '5');
    
    await page.click('button:has-text("Create Trainer")');

    // Wait for success toast
    const toast = page.getByText(/Trainer created successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('h2:has-text("New Trainer")')).not.toBeVisible();
    
    // Verify trainer is in the list
    await page.fill('input[placeholder*="Search"]', email);
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${email}`).first()).toBeVisible();
  });

  test('Duplicate Trainer Email Error', async ({ page }) => {
    const email = generateRandomEmail();
    
    // Create first trainer
    await page.click('button:has-text("Add Trainer")');
    await page.fill('input[name="fullName"]', 'Dup Trainer 1');
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Trainer")');
    await page.waitForSelector('.toast-success', { timeout: 10000 }).catch(() => {});
    
    // Attempt duplicate
    await page.click('button:has-text("Add Trainer")');
    await page.fill('input[name="fullName"]', 'Dup Trainer 2');
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Trainer")');

    // Verify error toast
    const errorToast = page.getByText(/already exists/i);
    await errorToast.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Search Trainers', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'NonExistentTrainerName123');
    await page.waitForTimeout(1000);
    
    // Verify empty state
    await expect(page.locator('text=No trainers found')).toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(1000);
  });

  test('Edit Trainer', async ({ page }) => {
    const email = generateRandomEmail();
    
    // Create
    await page.click('button:has-text("Add Trainer")');
    await page.fill('input[name="fullName"]', 'Edit Me Trainer');
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Trainer")');
    await page.waitForTimeout(1000);

    // Search
    await page.fill('input[placeholder*="Search"]', email);
    await page.waitForTimeout(1000);

    // Find the row containing our email, then click the ellipsis button
    const row = page.locator('tr').filter({ hasText: email });
    await row.locator('button').last().click();
    await page.click('button:has-text("Edit Trainer")');
    
    // Modal appears
    await expect(page.locator('h2:has-text("Edit Trainer")')).toBeVisible();

    // Modify name
    await page.fill('input[name="fullName"]', 'Edited Trainer');
    await page.click('button:has-text("Save Changes")');

    // Wait for success toast
    const toast = page.getByText(/Trainer updated successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify change
    await expect(page.locator(`text=Edited Trainer`).first()).toBeVisible();
  });

  test('Delete Trainer', async ({ page }) => {
    const email = generateRandomEmail();
    
    // Create
    await page.click('button:has-text("Add Trainer")');
    await page.fill('input[name="fullName"]', 'Delete Me Trainer');
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Trainer")');
    await page.waitForTimeout(1000);

    // Search
    await page.fill('input[placeholder*="Search"]', email);
    await page.waitForTimeout(1000);

    // Delete
    const row = page.locator('tr').filter({ hasText: email });
    await row.locator('button').last().click();
    
    // Confirm deletion modal if any (browser confirm)
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Delete")');

    // Wait for success
    const toast = page.getByText(/Trainer deleted/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify empty state for that search
    await expect(page.locator('text=No trainers found')).toBeVisible();
  });
});
