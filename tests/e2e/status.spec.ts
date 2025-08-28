import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000'

async function expectHealthy(page: any, path: string, mustContain: RegExp) {
  const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
  expect(res?.status(), path).toBeLessThan(400)
  await expect(page.locator('body')).toContainText(mustContain)
  await expect(page.locator('body')).not.toContainText(/Application error/i)
  const scripts = await page.locator('script[src*="/_next/static/"]')
  await expect(scripts).toHaveCountGreaterThan(0)
}

test('critical pages are healthy', async ({ page }) => {
  await expectHealthy(page, '/forgot-password', /Forgot Password/i)
  await expectHealthy(page, '/account/reset?token=dummy', /Reset Password/i)
  await expectHealthy(page, '/account/verify?token=dummy', /Verify/i)
})
