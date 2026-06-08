import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MenuBar from '../MenuBar.jsx';

afterEach(() => vi.restoreAllMocks());

function renderWith(menuData) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(menuData),
    }),
  );
  return render(
    <QueryClientProvider client={client}>
      <MenuBar />
    </QueryClientProvider>,
  );
}

describe('MenuBar', () => {
  it('always renders the three static menu titles', () => {
    renderWith({ items: [] });
    expect(screen.getByTestId('menu-title-workbench')).toHaveTextContent(
      'Workbench',
    );
    expect(screen.getByTestId('menu-title-window')).toHaveTextContent('Window');
    expect(screen.getByTestId('menu-title-icons')).toHaveTextContent('Icons');
  });

  it('appends WP nav menu items after the static titles', async () => {
    renderWith({ items: [{ id: 7, title: 'Demos' }] });
    await waitFor(() =>
      expect(screen.getByTestId('menu-title-wp-7')).toHaveTextContent('Demos'),
    );
  });
});
