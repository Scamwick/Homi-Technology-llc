import { test, expect } from '@playwright/test'

test.describe('Financial Tools', () => {
  test('monte carlo calculator loads and calculates', async ({ page }) => {
    await page.goto('/tools/monte-carlo')
    // Should have input fields
    await expect(page.getByText(/Monte Carlo/i)).toBeVisible()
  })

  test('debt payoff calculator loads', async ({ page }) => {
    await page.goto('/tools/debt-payoff')
    await expect(page.getByText(/Debt/i)).toBeVisible()
  })

  test('PITI calculator loads', async ({ page }) => {
    await page.goto('/tools/piti')
    await expect(page.getByText(/PITI/i)).toBeVisible()
  })
})
