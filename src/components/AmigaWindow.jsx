import { useRef } from 'react';
import { useStore } from '../store.js';
import { usePage, usePost, usePosts } from '../hooks/useWpQuery.js';
import { sanitizeHtml } from '../lib/sanitize.js';
import useWindowDrag from '../hooks/useWindowDrag.js';

/**
 * A single draggable, resizable Amiga-styled window. Three gadgets in the
 * title bar (close left; depth + zoom right). Content is selected by
 * window.kind: 'page', 'post', 'category', 'about'.
 */
export default function AmigaWindow({ window: win }) {
  const focusedId = useStore((s) => s.focusedWindowId);
  const focused = focusedId === win.id;
  const closeWindow = useStore((s) => s.closeWindow);
  const focusWindow = useStore((s) => s.focusWindow);

  const titleRef = useRef(null);
  const sizeRef = useRef(null);
  useWindowDrag(titleRef, win.id, 'move');
  useWindowDrag(sizeRef, win.id, 'resize');

  const style = {
    transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
    width: `${win.w}px`,
    height: `${win.h}px`,
    zIndex: win.z,
  };

  return (
    <div
      className={`amiga-window ${focused ? 'is-focused' : ''}`}
      data-testid={`window-${win.id}`}
      data-amiga-window
      data-focused={focused || undefined}
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      <div className="amiga-window-titlebar" data-testid={`title-${win.id}`}>
        <button
          type="button"
          className="amiga-gadget close"
          data-testid={`close-${win.id}`}
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            closeWindow(win.id);
          }}
        />
        <div
          className="amiga-window-title-drag"
          ref={titleRef}
          data-testid={`drag-${win.id}`}
        >
          {win.title}
        </div>
        <button
          type="button"
          className="amiga-gadget zoom"
          aria-label="Zoom"
        />
        <button
          type="button"
          className="amiga-gadget depth"
          aria-label="Front/Back"
        />
      </div>

      <div className="amiga-window-content" data-testid={`content-${win.id}`}>
        <WindowContent win={win} />
      </div>

      <button
        type="button"
        ref={sizeRef}
        className="amiga-sizing-gadget"
        data-testid={`size-${win.id}`}
        aria-label="Resize"
      />
    </div>
  );
}

function WindowContent({ win }) {
  if (win.kind === 'page') return <PageView id={win.contentId} />;
  if (win.kind === 'post') return <PostView id={win.contentId} />;
  if (win.kind === 'category') return <CategoryView id={win.contentId} />;
  if (win.kind === 'about') return <AboutView />;
  return <p>Unknown window kind: {win.kind}</p>;
}

function PageView({ id }) {
  const { data, isLoading, isError } = usePage(id);
  if (isLoading) return <p className="window-status">Loading…</p>;
  if (isError) return <p className="window-status">Failed to load page.</p>;
  const html = sanitizeHtml(data?.content?.rendered ?? '');
  return (
    <article
      className="wp-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PostView({ id }) {
  const { data, isLoading, isError } = usePost(id);
  if (isLoading) return <p className="window-status">Loading…</p>;
  if (isError) return <p className="window-status">Failed to load post.</p>;
  const html = sanitizeHtml(data?.content?.rendered ?? '');
  return (
    <article
      className="wp-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CategoryView({ id }) {
  const { data: posts = [], isLoading } = usePosts();
  const openWindow = useStore((s) => s.openWindow);
  if (isLoading) return <p className="window-status">Loading…</p>;
  const filtered = posts.filter((p) => p.categories?.includes(id));
  if (filtered.length === 0) {
    return <p className="window-status">No posts in this drawer.</p>;
  }
  return (
    <ul className="category-list">
      {filtered.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            className="category-link"
            data-testid={`open-post-${p.id}`}
            onClick={() =>
              openWindow({
                id: `post-${p.id}`,
                kind: 'post',
                contentId: p.id,
                title: p.title?.rendered ?? p.slug,
                x: 120 + Math.random() * 80,
                y: 100 + Math.random() * 80,
                w: 520,
                h: 360,
              })
            }
          >
            {p.title?.rendered ?? p.slug}
          </button>
        </li>
      ))}
    </ul>
  );
}

function AboutView() {
  return (
    <div className="about-credits">
      <h2>About this Workbench</h2>
      <p>
        A WordPress site dressed as Amiga 1200 Workbench 3.1. Drag the title
        bar down to reveal the back screen with AROS Workbench.
      </p>
      <h3>Credits</h3>
      <ul>
        <li>
          Topaz font —{' '}
          <a
            href="https://github.com/emartisoft/AmigaTopazFont"
            target="_blank"
            rel="noreferrer noopener"
          >
            emartisoft/AmigaTopazFont
          </a>
        </li>
        <li>
          SAE (Scripted Amiga Emulator) —{' '}
          <a
            href="https://github.com/naTmeg/ScriptedAmigaEmulator"
            target="_blank"
            rel="noreferrer noopener"
          >
            naTmeg/ScriptedAmigaEmulator
          </a>
        </li>
        <li>
          AROS — <a href="https://aros.sourceforge.io/">aros.sourceforge.io</a>
        </li>
        <li>
          React — <a href="https://react.dev/">react.dev</a>
        </li>
        <li>
          Vite — <a href="https://vitejs.dev/">vitejs.dev</a>
        </li>
        <li>
          TanStack Query —{' '}
          <a href="https://tanstack.com/query">tanstack.com/query</a>
        </li>
        <li>
          Zustand —{' '}
          <a href="https://github.com/pmndrs/zustand">pmndrs/zustand</a>
        </li>
        <li>
          DOMPurify —{' '}
          <a href="https://github.com/cure53/DOMPurify">cure53/DOMPurify</a>
        </li>
      </ul>
    </div>
  );
}

export const ABOUT_WINDOW = {
  id: 'about',
  kind: 'about',
  title: 'About Workbench',
  x: 160,
  y: 80,
  w: 480,
  h: 400,
};
