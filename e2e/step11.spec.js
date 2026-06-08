import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

async function pullDownScreen(page, dy) {
  const bar = page.getByTestId('screen-title-bar');
  const box = await bar.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + dy, { steps: 8 });
  await page.mouse.up();
}

test.describe('step11: drives + LEDs', () => {
  test('Disks menu opens the DriveSelector window', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-disks').click();
    await page.getByTestId('pulldown-item-manage-drives').click();
    await expect(page.getByTestId('window-drives')).toBeVisible();
    await expect(page.getByTestId('drive-row-df0')).toBeVisible();
    await expect(page.getByTestId('drive-row-dh0')).toBeVisible();
    await shot(page, 'step11-a');
  });

  test('LED panel renders once the emulator is past OFF state', async ({
    page,
  }) => {
    await page.goto('/');
    await pullDownScreen(page, 700);
    await page.getByTestId('power-on').click();
    // LedPanel renders when status !== 'off' (loading/running/error)
    await expect(page.getByTestId('led-panel')).toBeVisible();
    await expect(page.getByTestId('led-power')).toBeVisible();
    await expect(page.getByTestId('led-df0')).toBeVisible();
    await shot(page, 'step11-b');
  });

  test('"New blank" is disabled with no SAE; enabled once running', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-disks').click();
    await page.getByTestId('pulldown-item-manage-drives').click();
    // No SAE yet — buttons disabled
    await expect(page.getByTestId('drive-blank-df1')).toBeDisabled();
    // Close window, power on, re-open
    await page.getByTestId('close-drives').click();
    await pullDownScreen(page, 700);
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('back-screen')).toHaveAttribute(
      'data-status',
      'running',
      { timeout: 15000 },
    );
    // Close drag offset so the disks menu pulldown isn't visually buried
    await page.keyboard.press('Escape');
    await page.getByTestId('menu-title-disks').click();
    await page.getByTestId('pulldown-item-manage-drives').click();
    await expect(page.getByTestId('drive-blank-df1')).toBeEnabled();
  });
});
