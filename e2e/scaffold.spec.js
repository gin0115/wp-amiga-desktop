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
    // Confirm the face is loaded in the font face set, not via subtitle text
    // (which evolves between steps).
    const loaded = await page.evaluate(() =>
      [...document.fonts].some(
        (f) => f.family === 'Topaz' && f.status === 'loaded',
      ),
    );
    expect(loaded).toBe(true);
    await shot(page, 'step2-a');
  });

  test('mock WP fixtures are reachable at /mocks/wp-json/ (with rewriting)', async ({
    request,
  }) => {
    // Vite middleware appends .json so extension-less URLs work too
    const cats = await request.get('/mocks/wp-json/wp/v2/categories');
    expect(cats.ok()).toBe(true);
    const catsJson = await cats.json();
    expect(Array.isArray(catsJson)).toBe(true);
    expect(catsJson.length).toBeGreaterThanOrEqual(6);

    const post = await request.get(
      '/mocks/wp-json/wp/v2/posts/101?_embed=1',
    );
    expect(post.ok()).toBe(true);
    const postJson = await post.json();
    expect(postJson.title.rendered).toMatch(/Workbench 3\.1 Release Notes/);
    expect(postJson._embedded['wp:featuredmedia'][0].source_url).toContain(
      'placehold',
    );

    const menu = await request.get('/mocks/wp-json/menus/v1/menus/primary');
    expect(menu.ok()).toBe(true);
    const menuJson = await menu.json();
    expect(menuJson.items.length).toBe(4);
  });
});

test.describe('step3: data layer', () => {
  test('App renders WP categories and primary menu via TanStack Query', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('amiga-root')).toBeVisible();
    await expect(page.getByText(/step3: data layer online/i)).toBeVisible();

    // Primary menu fetched from /mocks/wp-json/menus/v1/menus/primary
    const menuItems = page.getByTestId('primary-menu').locator('li');
    await expect(menuItems).toHaveCount(4);

    // Categories fetched from /mocks/wp-json/wp/v2/categories
    const cats = page.getByTestId('categories').locator('li');
    await expect(cats).toHaveCount(6);
    await expect(cats.first()).toContainText('Workbench');

    await shot(page, 'step3-a');
  });

  test('store wiring: poke updates offsetY in subtitle', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/offsetY 0/)).toBeVisible();
    await page.getByTestId('poke-store').click();
    await expect(page.getByText(/offsetY 120/)).toBeVisible();
    await shot(page, 'step3-b');
  });
});
