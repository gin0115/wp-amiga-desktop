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

test.describe('step9: SAE integration smoke', () => {
  test('all 28 SAE source files are served under /vendor/sae/sae/', async ({
    request,
  }) => {
    const files = [
      'prototypes', 'utils', 'dms', 'config', 'roms', 'memory',
      'autoconf', 'expansion', 'events', 'gayle', 'ide', 'filesys',
      'hardfile', 'dongle', 'input', 'serpar', 'custom', 'blitter',
      'copper', 'playfield', 'video', 'audio', 'cia', 'disk', 'rtc',
      'm68k', 'cpu', 'amiga',
    ];
    for (const f of files) {
      const r = await request.get(`/vendor/sae/sae/${f}.js`);
      expect(r.ok(), `expected ${f}.js to be reachable`).toBe(true);
    }
  });

  test('clicking Power leaves the OFF state (transitions to loading/running or error)', async ({
    page,
  }) => {
    await page.goto('/');
    await pullDownScreen(page, 700);
    await page.getByTestId('power-on').click();
    await expect(page.getByTestId('back-screen')).not.toHaveAttribute(
      'data-status',
      'off',
    );
    await shot(page, 'step9-a');
  });
});
