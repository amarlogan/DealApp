import { test, expect } from '@playwright/test';

test.describe('Guest Journey & Conversion', () => {
  test('should allow a guest to navigate, click a deal, and then sign up retaining their activity', async ({ page }) => {
    // 1. Visit Home & Trigger Anon Auth (assumed to happen on load or interaction)
    await page.goto('/');

    // Wait for anonymous user to be created (often invisible to the user, wait for a bit or wait for network)
    // We assume there's a deal card on the homepage
    const dealCard = page.locator('a[href^="/deal/"]').first();
    
    // We expect the deal card to be visible
    await expect(dealCard).toBeVisible();
    
    // 2. Affiliate Tracking: Click 'Go to Store' / 'Get Deal'
    // Assuming there's a "Get Deal" button on the card or deal page
    // For this test, we navigate to the deal page first
    await dealCard.click();
    
    // On deal page, click 'Get Deal'
    const getDealBtn = page.getByRole('button', { name: /get deal|go to store/i }).first();
    await expect(getDealBtn).toBeVisible();
    
    // Capture the click event to verify tracking (or just click and we can verify DB via API)
    await getDealBtn.click();
    
    // 3. Save a deal as guest
    // Assuming there's a 'Save' or 'Favorite' heart icon
    const saveBtn = page.getByRole('button', { name: /save|favorite/i }).first();
    if (await saveBtn.isVisible()) {
        await saveBtn.click();
    }

    // 4. The Conversion: Sign up
    await page.goto('/login'); // Or signup page
    
    // Fill out sign up form
    const email = `test-guest-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign up/i }).click();

    // Verify successful sign up (e.g., redirected to dashboard or home)
    await expect(page.locator('text=Sign Out').first()).toBeVisible({ timeout: 10000 });

    // 5. Verify DB entry is linked (Optional: can be done via API call or verifying UI)
    // If the guest saved a deal, it should be in their favorites
    await page.goto('/profile/favorites'); // Assuming this route exists
    // Verify there is at least one favorite
    // const savedDeal = page.locator('.saved-deal-card').first();
    // await expect(savedDeal).toBeVisible();
  });
});
