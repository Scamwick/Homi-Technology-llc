import { test, expect } from "@playwright/test"

test("landing loads", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/HōMI/i)
})

test("protected route redirects to login", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/auth\/login/)
})
