import { test, expect } from '@playwright/test';
import { shot } from './helpers/screenshot.js';

test.describe('step1: scaffold', () => {
  test('app loads and renders the boot placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('amiga-root')).toBeVisible();
    await expect(page.getByText('Workbench 3.1')).toBeVisible();
    await expect(page.getByText('scaffolding online')).toBeVisible();
    await shot(page, 'step1-a');
  });
});
