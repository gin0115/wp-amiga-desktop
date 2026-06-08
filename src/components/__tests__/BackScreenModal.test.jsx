import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BackScreenModal from '../BackScreenModal.jsx';
import { useStore } from '../../store.js';

function renderWith() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ version: 1, items: [] }),
    }),
  );
  return render(
    <QueryClientProvider client={client}>
      <BackScreenModal />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useStore.setState({
    backModalSlot: null,
    saeRef: null,
    drives: {
      df0: { name: null, source: null, dirty: false },
      df1: { name: null, source: null, dirty: false },
      df2: { name: null, source: null, dirty: false },
      df3: { name: null, source: null, dirty: false },
      dh0: { name: null, source: null, dirty: false },
      dh1: { name: null, source: null, dirty: false },
    },
  });
});

afterEach(() => vi.restoreAllMocks());

describe('BackScreenModal', () => {
  it('renders nothing when backModalSlot is null', () => {
    const { container } = renderWith();
    expect(container.firstChild).toBe(null);
  });

  it('"power" slot renders the System modal (Kickstart picker + Power off)', () => {
    useStore.setState({
      backModalSlot: 'power',
      system: { kickstartUrl: null, kickstartExtUrl: null, bootFloppyUrl: null, hdfUrl: null },
    });
    renderWith();
    expect(screen.getByTestId('back-modal-power')).toBeInTheDocument();
    expect(screen.getByTestId('system-control')).toBeInTheDocument();
  });

  it('opens a slot-specific modal with DriveControl inside', () => {
    useStore.setState({ backModalSlot: 'df1' });
    renderWith();
    expect(screen.getByTestId('back-modal-df1')).toBeInTheDocument();
    expect(screen.getByTestId('drive-control-df1')).toBeInTheDocument();
  });

  it('close button calls closeBackModal', async () => {
    useStore.setState({ backModalSlot: 'dh0' });
    const user = userEvent.setup();
    renderWith();
    await user.click(screen.getByTestId('back-modal-close'));
    expect(useStore.getState().backModalSlot).toBe(null);
  });

  it('Escape closes the modal', () => {
    useStore.setState({ backModalSlot: 'df0' });
    renderWith();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(useStore.getState().backModalSlot).toBe(null);
  });
});
