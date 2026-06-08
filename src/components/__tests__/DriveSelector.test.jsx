import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DriveSelector from '../DriveSelector.jsx';
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

beforeEach(() => {
  useStore.setState({
    drives: {
      df0: { name: null, dirty: false },
      df1: { name: null, dirty: false },
      df2: { name: null, dirty: false },
      df3: { name: null, dirty: false },
      dh0: { name: null, dirty: false },
      dh1: { name: null, dirty: false },
    },
    saeRef: fakeSae(),
  });
});

describe('DriveSelector', () => {
  it('renders rows for 4 floppy + 2 hardfile slots', () => {
    render(<DriveSelector />);
    ['df0', 'df1', 'df2', 'df3', 'dh0', 'dh1'].forEach((slot) =>
      expect(screen.getByTestId(`drive-row-${slot}`)).toBeInTheDocument(),
    );
  });

  it('"New blank" mounts a blank ADF into the slot + updates name', async () => {
    const user = userEvent.setup();
    render(<DriveSelector />);
    await user.click(screen.getByTestId('drive-blank-df2'));
    const sae = useStore.getState().saeRef;
    expect(sae.cfg.floppy.drive[2].file.name).toBe('blank.adf');
    expect(useStore.getState().drives.df2.name).toBe('blank.adf');
    expect(sae.insert).toHaveBeenCalledWith(2);
  });

  it('Eject clears the slot and notifies SAE', async () => {
    const sae = useStore.getState().saeRef;
    sae.cfg.floppy.drive[0].file = {
      name: 'boot.adf',
      data: new Uint8Array(1),
      size: 1,
    };
    useStore.setState({
      drives: {
        ...useStore.getState().drives,
        df0: { name: 'boot.adf', dirty: false },
      },
    });
    const user = userEvent.setup();
    render(<DriveSelector />);
    await user.click(screen.getByTestId('drive-eject-df0'));
    expect(sae.eject).toHaveBeenCalledWith(0);
    expect(useStore.getState().drives.df0.name).toBe(null);
  });

  it('disables all action buttons when no SAE instance is mounted', () => {
    useStore.setState({ saeRef: null });
    render(<DriveSelector />);
    expect(screen.getByTestId('drive-insert-df0')).toBeDisabled();
    expect(screen.getByTestId('drive-blank-df0')).toBeDisabled();
  });
});
