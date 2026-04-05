import { test, expect } from '@playwright/test'

test.describe('App Pages (dev mode)', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')
  })

  test('assessment hub loads', async ({ page }) => {
    await page.goto('/assess')
    await expect(page).toHaveURL('/assess')
  })

  test('new assessment loads with questions', async ({ page }) => {
    await page.goto('/assess/new')
    await expect(page).toHaveURL('/assess/new')
  })

  test('tools page loads', async ({ page }) => {
    await page.goto('/tools')
    await expect(page.getByText(/Monte Carlo/i)).toBeVisible()
  })

  test('agent page loads', async ({ page }) => {
    await page.goto('/agent')
    await expect(page).toHaveURL('/agent')
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings')
  })

  test('onboarding page loads', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page.getByText(/Welcome/i)).toBeVisible()
  })
})
