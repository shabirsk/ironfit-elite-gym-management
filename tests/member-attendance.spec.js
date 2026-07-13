import { test, expect } from '@playwright/test';

test.describe('Member Attendance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/member/login');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/member/dashboard');
  });

  test('View Attendance Logs', async ({ page }) => {
    // Navigate to Attendance
    await page.goto('/member/attendance');
    
    // Check if table or empty state appears
    const noAttendance = page.locator('text=No attendance records found');
    const table = page.locator('.saas-table');
    
    await Promise.any([
      expect(noAttendance).toBeVisible(),
      expect(table).toBeVisible()
    ]);
  });
});
