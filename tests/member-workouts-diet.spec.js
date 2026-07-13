import { test, expect } from '@playwright/test';

test.describe('Member Workouts & Diet', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/member/login');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/member/dashboard');
  });

  test('View Workouts', async ({ page }) => {
    await page.goto('/member/workouts');
    
    // Check if table or empty state appears
    const noWorkouts = page.locator('text=No workouts assigned');
    const workoutCards = page.locator('.mp-workout-card');
    
    await Promise.any([
      expect(noWorkouts).toBeVisible({ timeout: 10000 }),
      expect(workoutCards.first()).toBeVisible({ timeout: 10000 })
    ]);
  });

  test('View Diet Plan', async ({ page }) => {
    await page.goto('/member/diet-plans');
    
    const noDiet = page.locator('text=No diet plans assigned');
    const dietCards = page.locator('.mp-card');
    
    await Promise.any([
      expect(noDiet).toBeVisible({ timeout: 10000 }),
      expect(dietCards.first()).toBeVisible({ timeout: 10000 })
    ]);
  });
});
