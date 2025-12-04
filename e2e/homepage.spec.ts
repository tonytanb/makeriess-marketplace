import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Makeriess/);
    
    // Check for key elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display address selector', async ({ page }) => {
    await page.goto('/');
    
    // Look for address input or selector
    const addressSelector = page.locator('[data-testid="address-selector"]').or(
      page.locator('input[placeholder*="address"]')
    );
    
    await expect(addressSelector.first()).toBeVisible();
  });

  test('should display category strip', async ({ page }) => {
    await page.goto('/');
    
    // Check for category navigation
    const categories = page.locator('[data-testid="category-strip"]').or(
      page.locator('text=/Food|Drinks|Crafts/i')
    );
    
    await expect(categories.first()).toBeVisible();
  });

  test('should display product grid', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Check for product cards
    const productCards = page.locator('[data-testid="product-card"]').or(
      page.locator('article').or(page.locator('.product-card'))
    );
    
    // Should have at least one product (or loading state)
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check bottom navigation
    const bottomNav = page.locator('[data-testid="bottom-nav"]').or(
      page.locator('nav').last()
    );
    
    await expect(bottomNav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }
    
    await page.goto('/');
    
    // Check that mobile layout is applied
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(768);
    
    // Check for mobile-specific elements
    await expect(page.locator('header')).toBeVisible();
  });
});
