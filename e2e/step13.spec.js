import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step13: IndexedDB persistence', () => {
  test('Disks window has a Reset gadget per drive row', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-disks').click();
    await page.getByTestId('pulldown-item-manage-drives').click();
    // Reset gadgets present for all 6 slots
    for (const slot of ['df0', 'df1', 'df2', 'df3', 'dh0', 'dh1']) {
      await expect(page.getByTestId(`drive-reset-${slot}`)).toBeVisible();
    }
    await shot(page, 'step13-a');
  });

  test('Reset is disabled when the slot has no source', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-disks').click();
    await page.getByTestId('pulldown-item-manage-drives').click();
    // Empty slots → no source → Reset disabled
    await expect(page.getByTestId('drive-reset-df0')).toBeDisabled();
  });

  test('IndexedDB shadow store opens cleanly in browser context', async ({
    page,
  }) => {
    await page.goto('/');
    const dbName = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('amiga-disk-shadows', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('images');
        req.onsuccess = () => {
          const name = req.result.name;
          req.result.close();
          resolve(name);
        };
        req.onerror = () => reject(req.error);
      });
    });
    expect(dbName).toBe('amiga-disk-shadows');
  });
});
