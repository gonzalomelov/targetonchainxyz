import percySnapshot from '@percy/playwright';
import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Boilerplate Code for Your Next.js Project with Tailwind CSS',
        }),
      ).toBeVisible();

      await percySnapshot(page, 'Homepage');
    });

    test('should take screenshot of the support page', async ({ page }) => {
      await page.goto('/support');

      await expect(
        page.getByRole('link', {
          name: 'Support',
        }),
      ).toBeVisible();

      await percySnapshot(page, 'Support');
    });
  });
});
