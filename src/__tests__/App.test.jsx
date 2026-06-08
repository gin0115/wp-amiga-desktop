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

describe('App data layer', () => {
  it('renders Workbench title and step3 subtitle immediately', () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) }),
    );
    renderApp();
    expect(screen.getByText('Workbench 3.1')).toBeInTheDocument();
    expect(screen.getByText(/step3: data layer online/i)).toBeInTheDocument();
  });

  it('renders categories once the WP query resolves', async () => {
    globalThis.fetch = vi.fn((req) => {
      const target = typeof req === 'string' ? req : req.url;
      if (target.includes('categories')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([{ id: 1, name: 'Workbench', count: 3 }]),
        });
      }
      if (target.includes('menus/v1/menus/primary')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({ items: [{ id: 1, title: 'Home' }] }),
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
      expect(screen.getByText(/Workbench \(3\)/)).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
