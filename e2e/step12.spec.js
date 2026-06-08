import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step12: library + Games drawer', () => {
  test('Games & Demos drawer icon appears on the desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('icon-library')).toBeVisible();
  });

  test('double-click opens the Library window and shows the AROS Boot Disk item', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('icon-library').dblclick();
    await expect(page.getByTestId('window-library')).toBeVisible();
    await expect(page.getByTestId('library-drawer')).toBeVisible();
    await expect(page.getByTestId('library-item-aros-bootdisk')).toBeVisible();
    await shot(page, 'step12-a');
  });

  test('Disks menu has a Games & Demos shortcut (A-G) that opens the same window', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-disks').click();
    await page.getByTestId('pulldown-item-games-demos').click();
    await expect(page.getByTestId('window-library')).toBeVisible();
  });

  test('library item is disabled until SAE is running', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('icon-library').dblclick();
    await expect(
      page.getByTestId('library-item-aros-bootdisk'),
    ).toBeDisabled();
  });

  test('library manifest is reachable at /library/manifest.json', async ({
    request,
  }) => {
    const r = await request.get('/library/manifest.json');
    expect(r.ok()).toBe(true);
    const json = await r.json();
    expect(json.items.length).toBeGreaterThan(0);
  });
});
