import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step6: desktop icons + windows', () => {
  test('desktop renders page and category icons', async ({ page }) => {
    await page.goto('/');
    // 3 pages from fixtures
    await expect(page.getByTestId('icon-page-1')).toBeVisible();
    await expect(page.getByTestId('icon-page-2')).toBeVisible();
    await expect(page.getByTestId('icon-page-3')).toBeVisible();
    // 6 categories
    for (let i = 1; i <= 6; i++) {
      await expect(page.getByTestId(`icon-category-${i}`)).toBeVisible();
    }
    await shot(page, 'step6-a');
  });

  test('double-click a page icon opens its window with sanitised content', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('icon-page-1').dblclick();
    await expect(page.getByTestId('window-page-1')).toBeVisible();
    await expect(page.getByTestId('window-page-1')).toContainText(
      /Amiga 1200 Workbench 3.1/,
    );
    await shot(page, 'step6-b');
  });

  test('Workbench → About menu opens the About credits window', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('menu-title-workbench').click();
    await page.getByTestId('pulldown-item-about').click();
    await expect(page.getByTestId('window-about')).toBeVisible();
    await expect(page.getByTestId('window-about')).toContainText(/Credits/);
    await expect(
      page.locator('a', { hasText: 'AmigaTopazFont' }),
    ).toHaveAttribute('href', /emartisoft/);
    await shot(page, 'step6-c');
  });

  test('closing a window via the close gadget removes it', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('icon-page-1').dblclick();
    await expect(page.getByTestId('window-page-1')).toBeVisible();
    await page.getByTestId('close-page-1').click();
    await expect(page.getByTestId('window-page-1')).toHaveCount(0);
  });

  test('opening a category drawer lists posts; clicking a post opens it', async ({
    page,
  }) => {
    await page.goto('/');
    // Category id 1 = Workbench (3 posts: 101, 105 in fixtures)
    await page.getByTestId('icon-category-1').dblclick();
    await expect(page.getByTestId('window-category-1')).toBeVisible();
    await page.getByTestId('open-post-101').click();
    await expect(page.getByTestId('window-post-101')).toBeVisible();
    await expect(page.getByTestId('window-post-101')).toContainText(
      /Workbench 3\.1 shipped in 1994/,
    );
    await shot(page, 'step6-d');
  });

  test('dragging the title bar moves the window', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('icon-page-1').dblclick();
    const drag = page.getByTestId('drag-page-1');
    const box = await drag.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 200, box.y + 150);
    await page.mouse.up();
    const win = page.getByTestId('window-page-1');
    const transform = await win.evaluate(
      (el) => el.style.transform,
    );
    expect(transform).toMatch(/translate3d\(\d+px/);
    await shot(page, 'step6-e');
  });
});
