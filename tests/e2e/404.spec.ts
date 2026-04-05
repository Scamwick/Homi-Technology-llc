import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page.getByText(/Page Not Found/i)).toBeVisible()
  })
})
