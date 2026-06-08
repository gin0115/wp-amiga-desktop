import { describe, it, expect } from 'vitest';
import {
  SCREEN_MODES,
  SCREEN_MODE_BY_ID,
  getScreenMode,
  HRES_LORES,
  HRES_HIRES,
  HRES_SUPERHIRES,
  VRES_NONDOUBLE,
  VRES_DOUBLE,
} from '../lib/screen-modes.js';

describe('screen-modes', () => {
  it('exposes the 8 classic Amiga modes split across two groups', () => {
    const ids = SCREEN_MODES.map((m) => m.id);
    expect(ids).toEqual([
      'lores-ntsc',
      'lores-pal',
      'hires-ntsc',
      'hires-pal',
      'hires-laced-ntsc',
      'hires-laced-pal',
      'super-hires',
      'super-hires-laced',
    ]);
    const groups = new Set(SCREEN_MODES.map((m) => m.group));
    expect(groups).toEqual(new Set(['Standard', 'Productivity']));
  });

  it('PAL/NTSC dimensions match the listed pixel sizes', () => {
    const byId = SCREEN_MODE_BY_ID;
    expect(byId.get('lores-ntsc')).toMatchObject({ width: 320, height: 200, ntsc: true });
    expect(byId.get('lores-pal')).toMatchObject({ width: 320, height: 256, ntsc: false });
    expect(byId.get('hires-pal')).toMatchObject({ width: 640, height: 256, ntsc: false });
    expect(byId.get('hires-laced-pal')).toMatchObject({ width: 640, height: 512, ntsc: false });
    expect(byId.get('super-hires-laced')).toMatchObject({ width: 1280, height: 512 });
  });

  it('SAE constants map sensibly', () => {
    expect(SCREEN_MODE_BY_ID.get('lores-pal').hres).toBe(HRES_LORES);
    expect(SCREEN_MODE_BY_ID.get('hires-pal').hres).toBe(HRES_HIRES);
    expect(SCREEN_MODE_BY_ID.get('super-hires').hres).toBe(HRES_SUPERHIRES);
    expect(SCREEN_MODE_BY_ID.get('hires-pal').vres).toBe(VRES_NONDOUBLE);
    expect(SCREEN_MODE_BY_ID.get('hires-laced-pal').vres).toBe(VRES_DOUBLE);
  });

  it('getScreenMode falls back to HiRes Laced PAL when id is bogus', () => {
    expect(getScreenMode('never-defined').id).toBe('hires-laced-pal');
    expect(getScreenMode(undefined).id).toBe('hires-laced-pal');
  });
});
