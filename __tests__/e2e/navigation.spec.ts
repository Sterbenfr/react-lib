import { test, expect } from '@playwright/test';

test('navigation test', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Recherche avancée');
    await expect(page).toHaveURL('http://localhost:3000/advanced-search');
});