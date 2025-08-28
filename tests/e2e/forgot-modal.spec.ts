import { test, expect } from '@playwright/test'

test('Forgot password link in login modal navigates to /forgot-password', async ({ page }) => {
  // Open login page (adjust path if needed)
  await page.goto('/auth/login')

  // Click forgot link
  const link = page.getByTestId('forgot-link-modal')
  await expect(link).toBeVisible()
  await link.click()

  await expect(page).toHaveURL(/\/forgot-password$/)
  await expect(page.getByRole('heading', { name: /Forgot Password/i })).toBeVisible()
})


