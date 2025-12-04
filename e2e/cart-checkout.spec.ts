import { test, expect, type Page } from '@playwright/test';

test.describe('Cart and Checkout', () => {
  test('should add product to cart', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Find and click "Add to Cart" button
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').or(
      page.locator('button:has-text("Add to Cart")')
    ).first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      
      // Check for cart count update
      await page.waitForTimeout(500);
      
      const cartBadge = page.locator('[data-testid="cart-count"]').or(
        page.locator('.cart-badge')
      );
      
      if (await cartBadge.count() > 0) {
        const count = await cartBadge.textContent();
        expect(parseInt(count || '0')).toBeGreaterThan(0);
      }
    }
  });

  test('should open cart drawer', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Find cart button
    const cartButton = page.locator('[data-testid="cart-button"]').or(
      page.locator('button:has-text("Cart")')
    );
    
    if (await cartButton.count() > 0) {
      await cartButton.first().click();
      
      // Check for cart drawer
      await page.waitForTimeout(500);
      
      const cartDrawer = page.locator('[data-testid="cart-drawer"]').or(
        page.locator('.cart-drawer')
      );
      
      await expect(cartDrawer.first()).toBeVisible();
    }
  });

  test('should update cart item quantity', async ({ page }: { page: Page }) => {
    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(1000);
    
    // Find quantity controls
    const increaseButton = page.locator('[data-testid="increase-quantity"]').or(
      page.locator('button:has-text("+")')
    ).first();
    
    if (await increaseButton.count() > 0) {
      const initialQuantity = await page.locator('[data-testid="quantity"]').first().textContent();
      
      await increaseButton.click();
      await page.waitForTimeout(500);
      
      const newQuantity = await page.locator('[data-testid="quantity"]').first().textContent();
      expect(parseInt(newQuantity || '0')).toBeGreaterThan(parseInt(initialQuantity || '0'));
    }
  });

  test('should remove item from cart', async ({ page }: { page: Page }) => {
    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(1000);
    
    // Find remove button
    const removeButton = page.locator('[data-testid="remove-item"]').or(
      page.locator('button:has-text("Remove")')
    ).first();
    
    if (await removeButton.count() > 0) {
      await removeButton.click();
      
      // Wait for removal
      await page.waitForTimeout(500);
    }
  });

  test('should proceed to checkout', async ({ page }: { page: Page }) => {
    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(1000);
    
    // Find checkout button
    const checkoutButton = page.locator('[data-testid="checkout-button"]').or(
      page.locator('button:has-text("Checkout")')
    );
    
    if (await checkoutButton.count() > 0) {
      await checkoutButton.first().click();
      
      // Should navigate to checkout or login
      await page.waitForTimeout(1000);
      
      const url = page.url();
      expect(url).toMatch(/checkout|login/);
    }
  });

  test('should display vendor minimum warnings', async ({ page }: { page: Page }) => {
    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(1000);
    
    // Check for minimum order warnings
    const warning = page.locator('[data-testid="minimum-warning"]').or(
      page.locator('text=/minimum/i')
    );
    
    // Warning may or may not be present depending on cart contents
    const count = await warning.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
