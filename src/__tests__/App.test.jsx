import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from '../App.jsx';

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App shell', () => {
  it('mounts the ScreenStack with back + front screens and title bar', () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) }),
    );
    renderApp();
    expect(screen.getByTestId('amiga-root')).toBeInTheDocument();
    expect(screen.getByTestId('screen-stack')).toBeInTheDocument();
    expect(screen.getByTestId('back-screen')).toBeInTheDocument();
    expect(screen.getByTestId('front-screen')).toBeInTheDocument();
    expect(screen.getByTestId('screen-title-bar')).toBeInTheDocument();
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
  });

  it('renders WP nav items as menu titles once the menu query resolves', async () => {
    globalThis.fetch = vi.fn((req) => {
      const target = typeof req === 'string' ? req : req.url;
      if (target.includes('menus/v1/menus/primary')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              items: [
                { id: 1, title: 'Home' },
                { id: 2, title: 'Posts' },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });
    });
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('menu-title-wp-1')).toHaveTextContent('Home');
      expect(screen.getByTestId('menu-title-wp-2')).toHaveTextContent('Posts');
    });
  });
});
