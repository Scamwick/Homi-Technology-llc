import { test, expect } from '@playwright/test'

test.describe('Auth Pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible()
  })

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.getByRole('button', { name: /Send Reset Link/i })).toBeVisible()
  })

  test('login links to signup', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('link', { name: /Create an account/i }).click()
    await expect(page).toHaveURL('/auth/signup')
  })
})
