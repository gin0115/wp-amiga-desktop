import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step1: scaffold', () => {
  test('app loads and renders the boot placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('amiga-root')).toBeVisible();
    await expect(page.getByText('Workbench 3.1')).toBeVisible();
    await shot(page, 'step1-a');
  });
});

test.describe('step2: topaz + fixtures', () => {
  test('topaz @font-face loads', async ({ page }) => {
    await page.goto('/');
    // Wait for the Topaz face to actually be loaded by the browser so the
    // screenshot below uses the real font, not the monospace fallback.
    await page.evaluate(() => document.fonts.load('14px Topaz'));
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByText(/Topaz online/i)).toBeVisible();
    await shot(page, 'step2-a');
  });

  test('mock WP fixtures are reachable at /mocks/wp-json/', async ({
    request,
  }) => {
    const cats = await request.get('/mocks/wp-json/wp/v2/categories.json');
    expect(cats.ok()).toBe(true);
    const catsJson = await cats.json();
    expect(Array.isArray(catsJson)).toBe(true);
    expect(catsJson.length).toBeGreaterThanOrEqual(6);

    const post = await request.get('/mocks/wp-json/wp/v2/posts/101.json');
    expect(post.ok()).toBe(true);
    const postJson = await post.json();
    expect(postJson.title.rendered).toMatch(/Workbench 3\.1 Release Notes/);

    const menu = await request.get('/mocks/wp-json/menus/v1/menus/primary.json');
    expect(menu.ok()).toBe(true);
    const menuJson = await menu.json();
    expect(menuJson.items.length).toBe(4);
  });
});
