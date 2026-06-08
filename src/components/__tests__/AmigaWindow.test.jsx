import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AmigaWindow, { ABOUT_WINDOW } from '../AmigaWindow.jsx';
import { useStore } from '../../store.js';

beforeEach(() => {
  useStore.setState({ windows: new Map(), focusedWindowId: null, nextZ: 1 });
});
afterEach(() => vi.restoreAllMocks());

function renderWindow(win, fetchImpl = () => Promise.resolve([])) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  globalThis.fetch = vi.fn((req) => {
    const target = typeof req === 'string' ? req : req.url;
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(fetchImpl(target)),
    });
  });
  useStore.getState().openWindow(win);
  return render(
    <QueryClientProvider client={client}>
      <AmigaWindow window={useStore.getState().windows.get(win.id)} />
    </QueryClientProvider>,
  );
}

describe('AmigaWindow chrome', () => {
  it('renders title, drag handle, close gadget, and sizing gadget', () => {
    renderWindow(ABOUT_WINDOW);
    expect(screen.getByTestId('window-about')).toBeInTheDocument();
    expect(screen.getByTestId('title-about')).toBeInTheDocument();
    expect(screen.getByTestId('drag-about')).toHaveTextContent(
      'About Workbench',
    );
    expect(screen.getByTestId('close-about')).toBeInTheDocument();
    expect(screen.getByTestId('size-about')).toBeInTheDocument();
  });

  it('close gadget removes the window from the store', async () => {
    const user = userEvent.setup();
    renderWindow(ABOUT_WINDOW);
    expect(useStore.getState().windows.has('about')).toBe(true);
    await user.click(screen.getByTestId('close-about'));
    expect(useStore.getState().windows.has('about')).toBe(false);
  });
});

describe('AmigaWindow content', () => {
  it('about kind renders the credits panel with upstream links', () => {
    renderWindow(ABOUT_WINDOW);
    expect(screen.getByText(/About this Workbench/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /AmigaTopazFont/i }),
    ).toHaveAttribute('href', expect.stringContaining('emartisoft'));
    expect(
      screen.getByRole('link', { name: /ScriptedAmigaEmulator/i }),
    ).toBeInTheDocument();
  });

  it('page kind renders sanitised WP content via fetch', async () => {
    renderWindow(
      {
        id: 'page-1',
        kind: 'page',
        contentId: 1,
        title: 'About',
        x: 0,
        y: 0,
        w: 400,
        h: 300,
      },
      () => ({
        content: {
          rendered:
            '<p>Page body</p><script>alert(1)</script><h2>Section</h2>',
        },
      }),
    );
    await waitFor(() => {
      expect(screen.getByText('Page body')).toBeInTheDocument();
    });
    // Script tag must be stripped by DOMPurify
    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByText('Section')).toBeInTheDocument();
  });
});
