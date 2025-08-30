import { test, expect } from '@playwright/test'

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'

async function expect200(page: any, path: string, contains?: RegExp) {
  const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBeLessThan(400)
  if (contains) {
    await expect(page.locator('body')).toContainText(contains)
  }
}

test('public routes return 200 after build', async ({ page }) => {
  await expect200(page, '/forgot-password', /Forgot Password/i)
  await expect200(page, '/account/reset?token=dummy', /Reset Password/i)
  await expect200(page, '/account/verify?token=dummy', /Verify/i)
})

test('static chunks and key APIs exist', async ({ page, request }) => {
  const apis = [
    '/api/auth/password/reset-request',
    '/api/auth/email/verify-request',
  ]
  for (const p of apis) {
    const r = await request.get(BASE + p)
    expect(r.status()).not.toBe(404)
  }
  const r = await request.get(BASE + '/_next/static/')
  expect(r.status()).not.toBe(404)
})

