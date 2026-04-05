import { test, expect } from '@playwright/test'

test.describe('Brand Compliance', () => {
  test('homepage has dark background', async ({ page }) => {
    await page.goto('/')
    const bg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    // Should NOT be white
    expect(bg).not.toBe('rgb(255, 255, 255)')
  })

  test('no page has white background', async ({ page }) => {
    const pages = ['/', '/about', '/pricing', '/homi-score', '/auth/login']
    for (const url of pages) {
      await page.goto(url)
      const bg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })
      expect(bg).not.toBe('rgb(255, 255, 255)')
    }
  })
})
