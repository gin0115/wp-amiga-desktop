import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

async function dragScreen(page, dy) {
  const bar = page.getByTestId('screen-title-bar');
  const box = await bar.boundingBox();
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Step the move so the browser actually fires pointermove.
  await page.mouse.move(startX, startY + dy, { steps: 8 });
  await page.mouse.up();
}

async function frontOffset(page) {
  return page.evaluate(() => {
    const front = document.querySelector('.front-screen');
    if (!front) return null;
    const m = front.style.transform.match(/translate3d\(0px, (\d+(?:\.\d+)?)px/);
    return m ? Number(m[1]) : 0;
  });
}

test.describe('step8: free-form screen-drag', () => {
  test('drag down moves the front screen 1:1, release leaves it there', async ({
    page,
  }) => {
    await page.goto('/');
    expect(await frontOffset(page)).toBe(0);
    await dragScreen(page, 250);
    const after = await frontOffset(page);
    // Allow a small slop because of pointermove event coalescing
    expect(after).toBeGreaterThanOrEqual(240);
    expect(after).toBeLessThanOrEqual(260);
    await shot(page, 'step8-a');
  });

  test('back screen is interactive once revealed; power-on works through it', async ({
    page,
  }) => {
    await page.goto('/');
    await dragScreen(page, 600);
    const offset = await frontOffset(page);
    expect(offset).toBeGreaterThan(500);
    // Power-on is on the back screen — clicking it must now work
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('back-screen')).toHaveAttribute(
      'data-status',
      'loading',
    );
    await shot(page, 'step8-b');
  });

  test('Escape returns the front screen to fully closed', async ({ page }) => {
    await page.goto('/');
    await dragScreen(page, 300);
    expect(await frontOffset(page)).toBeGreaterThan(280);
    await page.keyboard.press('Escape');
    expect(await frontOffset(page)).toBe(0);
  });

  test('drag inside an opened Amiga window does not move the screen', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('icon-page-1').dblclick();
    await expect(page.getByTestId('window-page-1')).toBeVisible();
    // Trying to drag inside the window's content shouldn't bubble to the
    // screen-drag handler. Window manager uses pointer-events:none, but the
    // title bar of the front screen is at the top; we're testing that the
    // screen offset stays at 0 after we drag within the window.
    const content = page.getByTestId('content-page-1');
    const box = await content.boundingBox();
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 20, box.y + 200, { steps: 6 });
    await page.mouse.up();
    expect(await frontOffset(page)).toBe(0);
  });
});
