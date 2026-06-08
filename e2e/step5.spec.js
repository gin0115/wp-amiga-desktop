import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step5: pulldown menus + shortcuts', () => {
  test('clicking the Workbench menu opens its pulldown', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-workbench').click();
    const pulldown = page.getByTestId('pulldown-workbench');
    await expect(pulldown).toBeVisible();
    await expect(page.getByTestId('pulldown-item-about')).toContainText(
      'About...',
    );
    await expect(page.getByTestId('pulldown-item-quit')).toContainText('Quit');
    await shot(page, 'step5-a');
  });

  test('hovering another title while open switches the pulldown', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-workbench').click();
    await expect(page.getByTestId('pulldown-workbench')).toBeVisible();
    await page.getByTestId('menu-title-window').hover();
    await expect(page.getByTestId('pulldown-workbench')).toHaveCount(0);
    await expect(page.getByTestId('pulldown-window')).toBeVisible();
    await shot(page, 'step5-b');
  });

  test('Escape closes the open pulldown', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-icons').click();
    await expect(page.getByTestId('pulldown-icons')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('pulldown-icons')).toHaveCount(0);
  });

  test('Ctrl+I fires the Information shortcut globally', async ({ page }) => {
    const messages = [];
    page.on('console', (msg) => messages.push(msg.text()));
    await page.goto('/');
    await page.keyboard.press('Control+I');
    // Action is "[menu] todo step6: open window for "Icon info"" — log lands
    // synchronously, but give the event loop a tick.
    await page.waitForTimeout(50);
    expect(messages.some((m) => m.includes('Icon info'))).toBe(true);
  });

  test('clicking outside an open pulldown closes it', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-window').click();
    await expect(page.getByTestId('pulldown-window')).toBeVisible();
    // Click far from the pulldown (right side of the desktop area).
    await page.getByTestId('desktop').click({ position: { x: 900, y: 400 } });
    await expect(page.getByTestId('pulldown-window')).toHaveCount(0);
  });
});
