import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the logo and tagline', async ({ page }) => {
    await expect(page.locator('text=HōMI')).toBeVisible()
    await expect(page.locator('text=The Emotionally Intelligent Decision OS')).toBeVisible()
  })

  test('should have a working CTA button', async ({ page }) => {
    const ctaButton = page.locator('text=Get Your Free Assessment')
    await expect(ctaButton).toBeVisible()
    await ctaButton.click()
    await expect(page).toHaveURL(/.*signup.*/)
  })

  test('should display pricing section', async ({ page }) => {
    await page.locator('text=Pricing').scrollIntoViewIfNeeded()
    await expect(page.locator('text=Simple, Transparent Pricing')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('text=HōMI')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Sign In')
    await expect(page).toHaveURL(/.*login.*/)
    await expect(page.locator('text=Sign in to your account')).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=Create one')
    await expect(page).toHaveURL(/.*signup.*/)
    await expect(page.locator('text=Create your account')).toBeVisible()
  })
})

test.describe('Authentication', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/signup')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Please enter a valid email')).toBeVisible()
  })
})
