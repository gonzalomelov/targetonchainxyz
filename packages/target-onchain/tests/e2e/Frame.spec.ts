import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Frame', () => {
  test.describe('CRUD operation', () => {
    test('should browse to frame, crate a new entry, read, update and remove the newly created', async ({
      page,
    }) => {
      await page.goto('/frame');
      await expect(page.getByText('Title')).toBeVisible();

      const title = faker.internet.userName();
      const image = faker.image.url();

      // Create
      await page.getByLabel('Title').fill(title);
      await page.getByLabel('Image').fill(image);
      await page.getByRole('button', { name: 'Save' }).click();

      const frameList = page.getByTestId('frame-list');

      // Read
      await expect(frameList.getByText(title)).toBeVisible();

      const updatedTitle = `${title} updated`;

      // Update
      await frameList.locator('button[aria-label=edit]').last().click();
      await frameList.getByText('Title').fill(updatedTitle);
      await frameList.getByRole('button', { name: 'Save' }).click();

      // Verify after update
      await expect(frameList.getByText(updatedTitle)).toBeVisible();

      // Delete
      await frameList.locator('button[aria-label=delete]').last().click();
      await expect(frameList.getByText(updatedTitle)).toBeHidden();
    });
  });
});
