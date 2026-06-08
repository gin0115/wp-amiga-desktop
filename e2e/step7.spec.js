import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step7: back screen powered-off + power gadget', () => {
  test('back screen starts in OFF state with a power gadget', async ({
    page,
  }) => {
    await page.goto('/');
    const back = page.getByTestId('back-screen');
    await expect(back).toHaveAttribute('data-status', 'off');
    await expect(page.getByTestId('crt-off')).toBeAttached();
    await expect(page.getByTestId('power-on')).toBeAttached();
    // step7-a captures the back screen in isolation by forcing the front
    // screen out of the way via inline style (real drag lands in step8).
    await page.evaluate(() => {
      const front = document.querySelector('.front-screen');
      if (front) front.style.transform = `translate3d(0, 90vh, 0)`;
    });
    await shot(page, 'step7-a');
  });

  test('clicking the power gadget transitions to loading state', async ({
    page,
  }) => {
    await page.goto('/');
    // Force the back screen visible so we can interact with it.
    await page.evaluate(() => {
      const root = document.querySelector('.front-screen');
      if (root) root.style.transform = `translate3d(0, 90vh, 0)`;
    });
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('back-screen')).toHaveAttribute(
      'data-status',
      'loading',
    );
    await expect(page.getByTestId('crt-loading')).toBeVisible();
    await shot(page, 'step7-b');
  });
});
