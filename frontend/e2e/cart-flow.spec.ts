import { test, expect } from '@playwright/test';

test('user logs in and adds product to cart', async ({ page }) => {
  // Go to login page
  await page.goto('http://localhost:5173/Login');
  await page.waitForTimeout(2000);

  // Use input types directly
  await page.fill('input[type="email"]', 'nikhil@gmail.com');
  await page.fill('input[type="password"]', 'password');

  // Only click the actual submit button, not the Google one
  await page.click('button[type="submit"]');

  // Wait for successful login redirect
  await page.waitForURL('**/Home');

  // Navigate to specific product page
  await page.goto('http://localhost:5173/Product/16');

  // Click Add to Cart
  await page.waitForSelector('button.add-to-cart-button');
  await page.click('button.add-to-cart-button');
});
