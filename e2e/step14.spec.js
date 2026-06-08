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

test.describe('step14: emulator-panel gadgets + modal', () => {
  test('blog menu bar has NO Disks menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('menu-title-disks')).toHaveCount(0);
  });

  test('no Games & Demos desktop icon on the front', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('icon-library')).toHaveCount(0);
  });

  test('gadget strip appears once emulator leaves OFF state', async ({
    page,
  }) => {
    await page.goto('/');
    await pullDownScreen(page, 800);
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('led-panel')).toBeVisible();
    await expect(page.getByTestId('gadget-power')).toBeVisible();
    for (const slot of ['df0', 'df1', 'df2', 'df3', 'dh0', 'dh1']) {
      await expect(page.getByTestId(`gadget-${slot}`)).toBeVisible();
    }
    // No CD gadget — SAE doesn't emulate one
    await expect(page.locator('[data-testid^="gadget-cd"]')).toHaveCount(0);
    await shot(page, 'step14-a');
  });

  test('clicking a drive gadget opens its modal inside the back screen', async ({
    page,
  }) => {
    await page.goto('/');
    await pullDownScreen(page, 800);
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('gadget-df1')).toBeVisible();
    await page.getByTestId('gadget-df1').click();
    await expect(page.getByTestId('back-modal-df1')).toBeVisible();
    await expect(page.getByTestId('drive-control-df1')).toBeVisible();
    // Modal lives inside BackScreen, not the front-screen WindowManager
    await expect(
      page.locator('[data-amiga-window][data-testid="window-drives"]'),
    ).toHaveCount(0);
    await shot(page, 'step14-b');
  });

  test('Escape closes the back modal', async ({ page }) => {
    await page.goto('/');
    await pullDownScreen(page, 800);
    await page.getByTestId('power-on').click();
    await page.getByTestId('gadget-dh0').click();
    await expect(page.getByTestId('back-modal-dh0')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('back-modal-dh0')).toHaveCount(0);
  });

  test('PWR gadget click opens the System modal; Power off button stops SAE', async ({
    page,
  }) => {
    await page.goto('/');
    await pullDownScreen(page, 800);
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('gadget-power')).toBeVisible();
    await page.getByTestId('gadget-power').click();
    await expect(page.getByTestId('back-modal-power')).toBeVisible();
    await expect(page.getByTestId('system-control')).toBeVisible();
    await page.getByTestId('system-power-off').click();
    await expect(page.getByTestId('back-screen')).toHaveAttribute(
      'data-status',
      'off',
    );
  });
});
