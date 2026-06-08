import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SystemControl from '../SystemControl.jsx';
import { useStore } from '../../store.js';

function renderWith(manifest) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(manifest),
    }),
  );
  return render(
    <QueryClientProvider client={client}>
      <SystemControl />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useStore.setState({
    backModalSlot: 'power',
    system: {
      kickstartUrl: './roms/aros-rom.bin',
      kickstartExtUrl: null,
      bootFloppyUrl: null,
      hdfUrl: null,
    },
    saeStatus: 'running',
    saeProgress: 0,
    saeError: null,
    bootToken: 1,
  });
});

afterEach(() => vi.restoreAllMocks());

describe('SystemControl', () => {
  it('renders one row per system source (rom / rom-ext / floppy / hdf)', async () => {
    renderWith({ version: 1, items: [] });
    await waitFor(() => {
      expect(screen.getByTestId('system-row-kickstartUrl')).toBeInTheDocument();
      expect(
        screen.getByTestId('system-row-kickstartExtUrl'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('system-row-bootFloppyUrl')).toBeInTheDocument();
      expect(screen.getByTestId('system-row-hdfUrl')).toBeInTheDocument();
    });
  });

  it('Power off button calls powerOff and closes the modal', async () => {
    const user = userEvent.setup();
    renderWith({ version: 1, items: [] });
    await user.click(screen.getByTestId('system-power-off'));
    expect(useStore.getState().saeStatus).toBe('off');
    expect(useStore.getState().backModalSlot).toBe(null);
  });

  it('picking a Kickstart ROM updates the systemSlice + cycles power', async () => {
    renderWith({
      version: 1,
      items: [
        {
          id: 'aros',
          title: 'AROS m68k',
          category: 'ROMs',
          kind: 'rom',
          slot: 'power',
          url: './roms/aros-rom.bin',
        },
        {
          id: 'kick31',
          title: 'Kickstart 3.1',
          category: 'ROMs',
          kind: 'rom',
          slot: 'power',
          url: './roms/kick31.rom',
        },
      ],
    });
    const beforeToken = useStore.getState().bootToken;
    const user = userEvent.setup();
    await waitFor(() =>
      screen.getByTestId('system-pick-kickstartUrl-kick31'),
    );
    await user.click(screen.getByTestId('system-pick-kickstartUrl-kick31'));
    expect(useStore.getState().system.kickstartUrl).toBe('./roms/kick31.rom');
    // cyclePower set status off → loading and bumped the token via microtask
    await waitFor(() => {
      const s = useStore.getState();
      expect(s.saeStatus).toBe('loading');
      expect(s.bootToken).toBe(beforeToken + 1);
    });
  });

  it('renders the 8 screen-mode pills grouped by Standard and Productivity', async () => {
    renderWith({ version: 1, items: [] });
    await waitFor(() =>
      expect(screen.getByTestId('system-row-screen-mode')).toBeInTheDocument(),
    );
    expect(
      screen.getByTestId('system-mode-group-standard'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('system-mode-group-productivity'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('system-mode-lores-pal')).toBeInTheDocument();
    expect(
      screen.getByTestId('system-mode-super-hires-laced'),
    ).toBeInTheDocument();
  });

  it('picking a screen mode updates the systemSlice + cycles power', async () => {
    renderWith({ version: 1, items: [] });
    const beforeToken = useStore.getState().bootToken;
    const user = userEvent.setup();
    await waitFor(() => screen.getByTestId('system-mode-lores-pal'));
    await user.click(screen.getByTestId('system-mode-lores-pal'));
    expect(useStore.getState().system.screenModeId).toBe('lores-pal');
    await waitFor(() => {
      const s = useStore.getState();
      expect(s.saeStatus).toBe('loading');
      expect(s.bootToken).toBe(beforeToken + 1);
    });
  });

  it('ROM-typed rows only see ROM-kind library items (floppy items hidden)', async () => {
    renderWith({
      version: 1,
      items: [
        { id: 'aros', title: 'AROS', kind: 'rom', url: 'r.rom' },
        { id: 'demo', title: 'A Demo', kind: 'adf', url: 'd.adf' },
      ],
    });
    await waitFor(() =>
      screen.getByTestId('system-pick-kickstartUrl-aros'),
    );
    expect(
      screen.queryByTestId('system-pick-kickstartUrl-demo'),
    ).toBeNull();
    expect(
      screen.getByTestId('system-pick-bootFloppyUrl-demo'),
    ).toBeInTheDocument();
  });
});
