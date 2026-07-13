import { test, expect } from '@playwright/test';

test.describe('Admin Member Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    
    // Navigate to Members
    await page.goto('/admin/members');
    await page.waitForSelector('.saas-table-container');
  });

  const generateRandomEmail = () => `testmember_${Date.now()}@example.com`;

  test('Create Member Success', async ({ page }) => {
    const email = generateRandomEmail();
    
    await page.click('button:has-text("Add Member")');
    await expect(page.locator('h2:has-text("New Member")')).toBeVisible();

    await page.fill('input[name="fullName"]', 'Test Playwright Member');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '1234567890');
    
    await page.click('button:has-text("Create Member")');

    // Wait for success toast
    const toast = page.getByText(/created successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('h2:has-text("New Member")')).not.toBeVisible();
    
    // Verify member is in the list
    await page.fill('input[placeholder*="Search"]', email);
    // Let debounce finish
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${email}`).first()).toBeVisible();
  });

  test('Duplicate Email Error', async ({ page }) => {
    const email = generateRandomEmail();
    
    // Create first member
    await page.click('button:has-text("Add Member")');
    await page.fill('input[name="fullName"]', 'Dup Member 1');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '1111111111');
    await page.click('button:has-text("Create Member")');
    await page.waitForSelector('.toast-success', { timeout: 10000 }).catch(() => {}); // Might not have this class
    
    // Attempt duplicate
    await page.click('button:has-text("Add Member")');
    await page.fill('input[name="fullName"]', 'Dup Member 2');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '2222222222');
    await page.click('button:has-text("Create Member")');

    // Verify error toast
    const errorToast = page.getByText(/already exists/i);
    await errorToast.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Search and Filter Members', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'NonExistentMemberName123');
    await page.waitForTimeout(1000);
    
    // Verify empty state
    await expect(page.locator('text=No members found')).toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(1000);

    // Filter by Active status
    await page.selectOption('select:has(option[value="active"])', 'active');
    await page.waitForTimeout(1000);
    
    // Optionally check if active badges are visible
    const badges = page.locator('.saas-badge.success');
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('Edit Member', async ({ page }) => {
    // Search for a member to edit (using an existing one or creating one)
    const email = generateRandomEmail();
    
    // Create
    await page.click('button:has-text("Add Member")');
    await page.fill('input[name="fullName"]', 'Edit Me');
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Member")');
    await page.waitForTimeout(1000);

    // Search
    await page.fill('input[placeholder*="Search"]', email);
    await page.waitForTimeout(1000);

    // Find the row containing our email, then click the ellipsis button
    const row = page.locator('tr').filter({ hasText: email });
    await row.locator('button').last().click();
    await page.click('button:has-text("Edit")');
    
    // Modal appears
    await expect(page.locator('h2:has-text("Edit Member")')).toBeVisible();

    // Modify name
    await page.fill('input[name="fullName"]', 'Edited Playwright Member');
    await page.click('button:has-text("Save Changes")');

    // Wait for success toast
    const toast = page.getByText(/updated successfully/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify change
    await expect(page.locator(`text=Edited Playwright Member`).first()).toBeVisible();
  });

  test('Delete Member', async ({ page }) => {
    const email = generateRandomEmail();
    
    // Create
    await page.click('button:has-text("Add Member")');
    await page.fill('input[name="fullName"]', 'Delete Me');
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Member")');
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
    const toast = page.getByText(/Member deleted/i);
    await toast.waitFor({ state: 'visible', timeout: 10000 });

    // Verify empty state for that search
    await expect(page.locator('text=No members found')).toBeVisible();
  });
});
