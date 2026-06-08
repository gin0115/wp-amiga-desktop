import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a',
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'figure',
  'figcaption',
  'hr',
  'span',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'];

export function sanitizeHtml(raw) {
  return DOMPurify.sanitize(raw ?? '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    USE_PROFILES: { html: true },
  });
}
