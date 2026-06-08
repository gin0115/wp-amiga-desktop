import { useCategories, usePages } from '../hooks/useWpQuery.js';
import DiskIcon from './DiskIcon.jsx';
import WindowManager from './WindowManager.jsx';

// Default geometry for windows that open from an icon; WindowManager
// staggers subsequent windows in code.
const DEFAULT_W = 520;
const DEFAULT_H = 360;

export default function Desktop() {
  const { data: pages = [] } = usePages();
  const { data: categories = [] } = useCategories();

  return (
    <div className="desktop" data-testid="desktop">
      <div className="desktop-icons" data-testid="desktop-icons">
        {pages.map((p, i) => (
          <DiskIcon
            key={`page-${p.id}`}
            glyph="page"
            label={p.title?.rendered ?? p.slug}
            testId={`icon-page-${p.id}`}
            window={{
              id: `page-${p.id}`,
              kind: 'page',
              contentId: p.id,
              title: p.title?.rendered ?? p.slug,
              x: 80 + i * 30,
              y: 60 + i * 30,
              w: DEFAULT_W,
              h: DEFAULT_H,
            }}
          />
        ))}
        {categories.map((c, i) => (
          <DiskIcon
            key={`category-${c.id}`}
            glyph="drawer"
            label={c.name}
            testId={`icon-category-${c.id}`}
            window={{
              id: `category-${c.id}`,
              kind: 'category',
              contentId: c.id,
              title: c.name,
              x: 140 + i * 30,
              y: 120 + i * 30,
              w: DEFAULT_W,
              h: DEFAULT_H,
            }}
          />
        ))}
      </div>
      <WindowManager />
    </div>
  );
}
