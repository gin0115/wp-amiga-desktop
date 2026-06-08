import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step4: front-screen chrome', () => {
  test('title bar, menu bar and screen info render', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('screen-title-bar')).toBeVisible();
    await expect(page.getByTestId('menu-bar')).toBeVisible();
    await expect(page.getByTestId('screen-info')).toContainText(
      'Workbench Screen',
    );
    await shot(page, 'step4-a');
  });

  test('static menus and WP nav menu items appear as titles', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('menu-title-workbench')).toContainText(
      'Workbench',
    );
    await expect(page.getByTestId('menu-title-window')).toContainText('Window');
    await expect(page.getByTestId('menu-title-icons')).toContainText('Icons');

    // WP menu titles come from /mocks/wp-json/menus/v1/menus/primary
    // (4 items: Home, Posts, Demos, Colophon).
    const wpTitles = page.locator('[data-testid^="menu-title-wp-"]');
    await expect(wpTitles).toHaveCount(4);
    await expect(wpTitles.nth(0)).toContainText('Home');
    await shot(page, 'step4-b');
  });

  test('desktop and back-screen placeholder are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('desktop')).toBeVisible();
    await expect(page.getByTestId('back-screen')).toContainText(
      /AROS Workbench/,
    );
  });
});
