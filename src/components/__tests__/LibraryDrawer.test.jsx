import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import LibraryDrawer from '../LibraryDrawer.jsx';
import { useStore } from '../../store.js';

function fakeSae() {
  return {
    cfg: {
      floppy: { drive: [0, 1, 2, 3].map(() => ({ file: {} })) },
      hardfile: { drive: [0, 1].map(() => ({ file: {} })) },
    },
    getConfig() {
      return this.cfg;
    },
    insert: vi.fn(),
    eject: vi.fn(),
  };
}

function renderWith(manifest, opts = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  globalThis.fetch = vi.fn((req) => {
    const target = typeof req === 'string' ? req : req.url;
    if (target.includes('manifest.json')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(manifest),
      });
    }
    // Library item fetch
    return Promise.resolve({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(880 * 1024)),
    });
  });
  if (opts.sae !== null) useStore.setState({ saeRef: opts.sae ?? fakeSae() });
  return render(
    <QueryClientProvider client={client}>
      <LibraryDrawer />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useStore.setState({
    saeRef: null,
    drives: {
      df0: { name: null, dirty: false },
      df1: { name: null, dirty: false },
      df2: { name: null, dirty: false },
      df3: { name: null, dirty: false },
      dh0: { name: null, dirty: false },
      dh1: { name: null, dirty: false },
    },
  });
});
afterEach(() => vi.restoreAllMocks());

describe('LibraryDrawer', () => {
  it('shows an empty-library hint when the manifest has no items', async () => {
    renderWith({ version: 1, items: [] });
    await waitFor(() =>
      expect(screen.getByText(/No items in the library/)).toBeInTheDocument(),
    );
  });

  it('groups items by category and renders them as clickable buttons', async () => {
    renderWith({
      version: 1,
      items: [
        { id: 'a', title: 'Solid Gold', category: 'Games', kind: 'adf', slot: 'df0', url: 'a.adf' },
        { id: 'b', title: 'State of the Art', category: 'Demos', kind: 'adf', slot: 'df0', url: 'b.adf' },
      ],
    });
    await waitFor(() => {
      expect(screen.getByText('Games')).toBeInTheDocument();
      expect(screen.getByText('Demos')).toBeInTheDocument();
    });
    expect(screen.getByTestId('library-item-a')).toBeInTheDocument();
    expect(screen.getByTestId('library-item-b')).toBeInTheDocument();
  });

  it('mounting an item fetches its url, mounts into the slot, updates drives slice', async () => {
    const sae = fakeSae();
    renderWith(
      {
        version: 1,
        items: [
          { id: 'a', title: 'Solid Gold', category: 'Games', kind: 'adf', slot: 'df1', url: 'a.adf' },
        ],
      },
      { sae },
    );
    await waitFor(() => screen.getByTestId('library-item-a'));
    const user = userEvent.setup();
    await user.click(screen.getByTestId('library-item-a'));
    await waitFor(() => {
      expect(useStore.getState().drives.df1.name).toBe('Solid Gold');
    });
    expect(sae.insert).toHaveBeenCalledWith(1);
    expect(sae.cfg.floppy.drive[1].file.name).toBe('Solid Gold');
  });

  it('items are disabled when SAE is not running', async () => {
    renderWith(
      {
        version: 1,
        items: [
          { id: 'a', title: 'Foo', category: 'Demos', kind: 'adf', slot: 'df0', url: 'a.adf' },
        ],
      },
      { sae: null },
    );
    await waitFor(() => screen.getByTestId('library-item-a'));
    expect(screen.getByTestId('library-item-a')).toBeDisabled();
  });
});
