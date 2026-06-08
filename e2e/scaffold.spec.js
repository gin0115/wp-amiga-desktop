import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('boot smoke', () => {
  test('app mounts and renders the ScreenStack', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('amiga-root')).toBeVisible();
    await expect(page.getByTestId('screen-stack')).toBeVisible();
    await expect(page.getByTestId('back-screen')).toBeVisible();
    await expect(page.getByTestId('front-screen')).toBeVisible();
    await shot(page, 'step1-a');
  });

  test('Topaz @font-face loads', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.load('14px Topaz'));
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() =>
      [...document.fonts].some(
        (f) => f.family === 'Topaz' && f.status === 'loaded',
      ),
    );
    expect(loaded).toBe(true);
    await shot(page, 'step2-a');
  });

  test('mock WP fixtures reachable via Vite middleware (no .json suffix)', async ({
    request,
  }) => {
    const cats = await request.get('/mocks/wp-json/wp/v2/categories');
    expect(cats.ok()).toBe(true);
    expect((await cats.json()).length).toBeGreaterThanOrEqual(6);

    const post = await request.get(
      '/mocks/wp-json/wp/v2/posts/101?_embed=1',
    );
    expect(post.ok()).toBe(true);
    expect((await post.json()).title.rendered).toMatch(
      /Workbench 3\.1 Release Notes/,
    );

    const menu = await request.get('/mocks/wp-json/menus/v1/menus/primary');
    expect(menu.ok()).toBe(true);
    expect((await menu.json()).items.length).toBe(4);
  });
});
