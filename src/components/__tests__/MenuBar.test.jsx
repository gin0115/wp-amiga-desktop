import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import MenuBar from '../MenuBar.jsx';
import { useStore } from '../../store.js';

afterEach(() => vi.restoreAllMocks());
beforeEach(() => {
  useStore.getState().closeMenu();
  useStore.setState({ windows: new Map(), focusedWindowId: null, nextZ: 1 });
});

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

  it('appends WP nav items after the static titles', async () => {
    renderWith({ items: [{ id: 7, title: 'Demos' }] });
    await waitFor(() =>
      expect(screen.getByTestId('menu-title-wp-7')).toHaveTextContent('Demos'),
    );
  });

  it('clicking a title opens the matching pulldown; clicking again closes', async () => {
    const user = userEvent.setup();
    renderWith({ items: [] });
    await user.click(screen.getByTestId('menu-title-workbench'));
    expect(screen.getByTestId('pulldown-workbench')).toBeInTheDocument();
    expect(screen.getByTestId('pulldown-item-about')).toBeInTheDocument();
    await user.click(screen.getByTestId('menu-title-workbench'));
    expect(screen.queryByTestId('pulldown-workbench')).toBeNull();
  });

  it('hovering another title while one is open switches the pulldown', async () => {
    const user = userEvent.setup();
    renderWith({ items: [] });
    await user.click(screen.getByTestId('menu-title-workbench'));
    expect(screen.getByTestId('pulldown-workbench')).toBeInTheDocument();
    await user.hover(screen.getByTestId('menu-title-window'));
    expect(screen.queryByTestId('pulldown-workbench')).toBeNull();
    expect(screen.getByTestId('pulldown-window')).toBeInTheDocument();
  });

  it('clicking the About item opens the about window and closes the menu', async () => {
    const user = userEvent.setup();
    renderWith({ items: [] });
    await user.click(screen.getByTestId('menu-title-workbench'));
    await user.click(screen.getByTestId('pulldown-item-about'));
    expect(useStore.getState().windows.has('about')).toBe(true);
    expect(screen.queryByTestId('pulldown-workbench')).toBeNull();
  });

  it('clicking a todo-stub item logs and closes the menu', async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderWith({ items: [] });
    await user.click(screen.getByTestId('menu-title-icons'));
    await user.click(screen.getByTestId('pulldown-item-empty-trash'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Empty trash'));
    expect(screen.queryByTestId('pulldown-icons')).toBeNull();
  });

  it('Escape closes any open menu', async () => {
    const user = userEvent.setup();
    renderWith({ items: [] });
    await user.click(screen.getByTestId('menu-title-workbench'));
    expect(screen.getByTestId('pulldown-workbench')).toBeInTheDocument();
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByTestId('pulldown-workbench')).toBeNull();
  });
});
