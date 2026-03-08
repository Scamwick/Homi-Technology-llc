import { test } from "@playwright/test"
import { injectAxe, checkA11y } from "@axe-core/playwright"

test("landing has no axe violations", async ({ page }) => {
  await page.goto("/")
  await injectAxe(page)
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  })
})
