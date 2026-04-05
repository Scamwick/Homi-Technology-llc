import { test, expect } from '@playwright/test'

test.describe('Marketing Pages', () => {
  test('homepage loads with compass and CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/HōMI/)
    // Check for key elements
    await expect(page.getByText('Will You Be Okay?')).toBeVisible()
    await expect(page.getByRole('link', { name: /Get Your.*Score/i })).toBeVisible()
  })

  test('about page loads', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByText(/Why we exist/i)).toBeVisible()
  })

  test('pricing page loads with tiers', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Plus')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
  })

  test('homi-score page loads', async ({ page }) => {
    await page.goto('/homi-score')
    await expect(page.getByText(/Score/i)).toBeVisible()
  })

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.getByText(/Terms/i)).toBeVisible()
  })

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByText(/Privacy/i)).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'About' }).click()
    await expect(page).toHaveURL('/about')
    await page.getByRole('link', { name: 'Pricing' }).click()
    await expect(page).toHaveURL('/pricing')
  })

  test('waitlist form accepts email', async ({ page }) => {
    await page.goto('/waitlist')
    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /Join/i }).click()
    // Should show success state
    await expect(page.getByText(/on the list/i)).toBeVisible()
  })
})
