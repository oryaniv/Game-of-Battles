import { test, expect } from '@playwright/test';

test.describe('Game Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming your Vue app is running on localhost:3000
    await page.goto('http://localhost:8081/Journey');
  });

  test.only('sound on/off', async ({ page }) => {
    await page.waitForTimeout(3000);
    // await page.click('button:has-text("Hell yes!")');
  });


  test('skip action with multiple combatants', async ({ page }) => {
    // Test case: 2 combatants per team, skip action
    // You'll need to set up the game state in your Vue app to match this scenario
    // (e.g., expose a way to configure combatants for testing).

    // Click the skip button
    await page.click('button:has-text("Skip")');

    // Assert that actionsRemaining is reduced by 0.5
    const actionsRemainingText = await page.textContent('.actions');
    expect(actionsRemainingText).toContain('Actions Remaining: 4.5'); // Or 1.5 if you only have one combatant

    // You might also add assertions about the game state (e.g., turn order) if needed
  });

  test('skip action with single combatant', async ({ page }) => {
    // Test case: 1 combatant per team, skip action
    // Set up the game state in your Vue app

    // Click the skip button
    await page.click('button:has-text("Skip")');

    // Assert that the turn has switched to the other team
    const turnMessageText = await page.textContent('.message');
    expect(turnMessageText).not.toContain('Black Team\'s Turn'); // Assuming Red Team starts
    expect(turnMessageText).toContain('White Team\'s Turn');

    // You can also add assertions about actionsRemaining if needed
  });

  test('defend action', async ({ page }) => {
    // Test case: 1 combatant per team, defend action
    // Set up the game state in your Vue app

    // Click the defend button
    await page.click('button:has-text("Defend")');

    // Assert that the turn has switched to the other team
    const turnMessageText = await page.textContent('.message');
    expect(turnMessageText).not.toContain('Black Team\'s Turn');
    expect(turnMessageText).toContain('White Team\'s Turn');

    // You might also add assertions to check if the "Defending" status effect is applied
    // (if you expose that in your UI)
  });
});