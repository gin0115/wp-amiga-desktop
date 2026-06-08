import { describe, it, expect } from 'vitest';
import { startSae } from '../lib/sae-loader.js';

describe('sae-loader', () => {
  it('throws NO_KICKSTART when kickstartUrl is unset', async () => {
    await expect(
      startSae({ container: document.createElement('div') }),
    ).rejects.toMatchObject({
      code: 'NO_KICKSTART',
      message: expect.stringContaining('VITE_KICKSTART_URL'),
    });
  });
});
