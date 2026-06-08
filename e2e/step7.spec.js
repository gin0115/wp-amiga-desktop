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

test.describe('step7: back screen powered-off + power gadget', () => {
  test('back screen starts in OFF state with a power gadget', async ({
    page,
  }) => {
    await page.goto('/');
    const back = page.getByTestId('back-screen');
    await expect(back).toHaveAttribute('data-status', 'off');
    await expect(page.getByTestId('crt-off')).toBeAttached();
    await expect(page.getByTestId('power-on')).toBeAttached();
    // Pull the front screen down so the back is fully visible for the shot.
    await pullDownScreen(page, 700);
    await shot(page, 'step7-a');
  });

  test('clicking the power gadget leaves the OFF state', async ({ page }) => {
    await page.goto('/');
    await pullDownScreen(page, 700);
    await page.getByTestId('power-on').click();
    // Without VITE_KICKSTART_URL the loader races to 'error'; with it,
    // we'd see 'loading' or 'running'. Either way, status must no longer
    // be 'off'.
    await expect(page.getByTestId('back-screen')).not.toHaveAttribute(
      'data-status',
      'off',
    );
    await shot(page, 'step7-b');
  });
});
