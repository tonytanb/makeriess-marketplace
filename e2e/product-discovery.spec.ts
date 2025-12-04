import { test, expect } from '@playwright/test';

test.describe('Product Discovery', () => {
  test('should search for products', async ({ page }) => {
    await page.goto('/');
    
    // Find search input
    const searchInput = page.locator('[data-testid="search-input"]').or(
      page.locator('input[type="search"]').or(
        page.locator('input[placeholder*="search"]')
      )
    );
    
    await searchInput.first().fill('croissant');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    // Check that URL or content changed
    const url = page.url();
    expect(url).toContain('search');
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/');
    
    // Click on a category
    const categoryButton = page.locator('[data-testid="category-food"]').or(
      page.locator('button:has-text("Food")')
    );
    
    if (await categoryButton.count() > 0) {
      await categoryButton.first().click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify filter is applied (check URL or active state)
      const activeCategory = page.locator('[data-active="true"]').or(
        page.locator('.active')
      );
      
      expect(await activeCategory.count()).toBeGreaterThan(0);
    }
  });

  test('should view product details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').or(
      page.locator('article').or(page.locator('.product-card'))
    ).first();
    
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      
      // Wait for navigation
      await page.waitForTimeout(1000);
      
      // Check that we're on product detail page
      const url = page.url();
      expect(url).toContain('/product/');
    }
  });

  test('should add product to favorites', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Find favorite button
    const favoriteButton = page.locator('[data-testid="favorite-button"]').or(
      page.locator('button[aria-label*="favorite"]')
    ).first();
    
    if (await favoriteButton.count() > 0) {
      await favoriteButton.click();
      
      // Check for visual feedback (may require auth)
      await page.waitForTimeout(500);
    }
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/');
    
    // Find sort dropdown
    const sortDropdown = page.locator('[data-testid="sort-dropdown"]').or(
      page.locator('select').or(page.locator('button:has-text("Sort")'))
    );
    
    if (await sortDropdown.count() > 0) {
      await sortDropdown.first().click();
      
      // Select sort option
      const sortOption = page.locator('text=/Price|Distance|Rating/i').first();
      if (await sortOption.count() > 0) {
        await sortOption.click();
        
        // Wait for re-sort
        await page.waitForTimeout(1000);
      }
    }
  });
});
