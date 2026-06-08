import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../lib/sanitize.js';

describe('sanitizeHtml', () => {
  it('passes through standard WP content tags', () => {
    const out = sanitizeHtml(
      '<p>Hello <strong>World</strong></p><h2>Section</h2><ul><li>a</li></ul>',
    );
    expect(out).toContain('<strong>World</strong>');
    expect(out).toContain('<h2>Section</h2>');
  });

  it('strips <script>', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).not.toContain(
      '<script',
    );
  });

  it('strips onclick attributes', () => {
    expect(
      sanitizeHtml('<a href="/x" onclick="boom()">go</a>'),
    ).not.toContain('onclick');
  });

  it('handles null/undefined safely', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
