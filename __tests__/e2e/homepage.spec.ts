import { test, expect } from '@playwright/test';

test('homepage shows recent changes', async ({ page }) => {
  await page.goto('/');
  
  // Check if the page title is correct
  await expect(page.locator('h1')).toHaveText('Changements récents');
  
  // Wait for content to load (adjust selector based on your actual UI)
  await page.waitForSelector('li');
  
  // Check if at least one change is displayed
  const changes = await page.locator('li').count();
  expect(changes).toBeGreaterThan(0);
});

test('book links work', async ({ page }) => {
  await page.goto('/');
  
  // Wait for content to load and find a book link
  await page.waitForSelector('a[href^="/books/"]');
  
  // Click the first book link
  const bookLink = page.locator('a[href^="/books/"]').first();
  const href = await bookLink.getAttribute('href');
  
  // Store the book title for later comparison
  const bookTitle = await bookLink.textContent();
  
  await bookLink.click();
  
  // Check if we're on the book page
  if (href) {
    await expect(page).toHaveURL(new RegExp(href));
  } else {
    throw new Error('Book link href is null');
  }
});