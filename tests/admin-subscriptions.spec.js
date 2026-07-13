import { test, expect } from '@playwright/test';

test.describe.serial('Admin Subscriptions Management', () => {
  let testMemberName = '';
  let testPlanName = '';

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@ironfit.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("AUTHORIZE ACCESS")');
    await page.waitForURL('**/admin/dashboard');
  });

  test('Create prerequisites', async ({ page }) => {
    // Create member
    testMemberName = `Sub Member ${Date.now()}`;
    const email = `sub_${Date.now()}@example.com`;
    
    await page.goto('/admin/members');
    await page.waitForSelector('.saas-table-container');
    await page.click('button:has-text("Add Member")');
    await page.fill('input[name="fullName"]', testMemberName);
    await page.fill('input[name="email"]', email);
    await page.click('button:has-text("Create Member")');
    await page.getByText(/Member created/i).waitFor({ state: 'visible', timeout: 10000 });

    // Create plan
    testPlanName = `Sub Plan ${Date.now()}`;
    await page.goto('/admin/plans');
    await page.waitForSelector('h1:has-text("Pricing Plans")');
    await page.click('button:has-text("New Plan")');
    await page.fill('input[required]', testPlanName);
    await page.fill('input[type="number"]', '50');
    // second number input is duration
    await page.locator('input[type="number"]').nth(1).fill('30');
    await page.click('button[type="submit"]:has-text("Create Plan")');
    await page.getByText(/Plan created/i).waitFor({ state: 'visible', timeout: 10000 });
  });

  test('Create Subscription', async ({ page }) => {
    await page.goto('/admin/subscriptions');
    await page.waitForSelector('h1:has-text("Subscriptions")');

    await page.click('button:has-text("New Subscription")');
    await expect(page.locator('h2:has-text("New Subscription")')).toBeVisible();

    // Select member and plan
    const memberOption = page.locator('select[required]').first().locator(`option:has-text("${testMemberName}")`);
    const memberValue = await memberOption.getAttribute('value');
    await page.locator('select[required]').first().selectOption(memberValue);

    const planSelect = page.locator('select[required]').nth(1);
    const planOption = planSelect.locator(`option:has-text("${testPlanName}")`);
    const planValue = await planOption.getAttribute('value');
    await planSelect.selectOption(planValue);

    await page.check('input#autoRenew');
    await page.click('button[type="submit"]:has-text("Create Subscription")');

    await page.getByText(/Subscription created successfully/i).waitFor({ state: 'visible', timeout: 10000 });

    // Verify in table
    await page.fill('input[placeholder*="Search"]', testMemberName);
    await expect(page.locator('table').locator(`text=${testMemberName}`).first()).toBeVisible();
    await expect(page.locator('table').locator(`text=${testPlanName}`).first()).toBeVisible();
    await expect(page.locator('table').locator('text=Yes').first()).toBeVisible(); // Auto-renew
  });
});
