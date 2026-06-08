import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DriveGadget from '../DriveGadget.jsx';
import { useStore } from '../../store.js';

beforeEach(() => {
  useStore.setState({ backModalSlot: null });
});

describe('DriveGadget', () => {
  it('floppy gadget: empty state when not mounted', () => {
    render(<DriveGadget slot="df0" kind="floppy" label="DF0" />);
    const g = screen.getByTestId('gadget-df0');
    expect(g).toHaveAttribute('data-state', 'empty');
    expect(g).toHaveTextContent('empty');
  });

  it('floppy gadget: mounted state shows the (truncated) name', () => {
    render(
      <DriveGadget
        slot="df0"
        kind="floppy"
        label="DF0"
        mounted
        name="state-of-the-art.adf"
      />,
    );
    const g = screen.getByTestId('gadget-df0');
    expect(g).toHaveAttribute('data-state', 'mounted');
    expect(g).toHaveTextContent('state-of-…');
  });

  it('active=true puts data-on on the corner LED', () => {
    render(<DriveGadget slot="df0" kind="floppy" label="DF0" active />);
    expect(
      screen.getByTestId('gadget-df0').querySelector('.drive-gadget-led'),
    ).toHaveAttribute('data-on');
  });

  it('click on a drive gadget opens the back modal for that slot', async () => {
    const user = userEvent.setup();
    render(<DriveGadget slot="dh1" kind="hardfile" label="DH1" />);
    await user.click(screen.getByTestId('gadget-dh1'));
    expect(useStore.getState().backModalSlot).toBe('dh1');
  });

  it('power gadget (default click) opens the System modal', async () => {
    const user = userEvent.setup();
    render(<DriveGadget slot="power" kind="power" label="PWR" mounted />);
    await user.click(screen.getByTestId('gadget-power'));
    expect(useStore.getState().backModalSlot).toBe('power');
  });

  it('a custom onClick prop overrides the default open-modal behaviour', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DriveGadget slot="df0" kind="floppy" label="DF0" onClick={onClick} />,
    );
    await user.click(screen.getByTestId('gadget-df0'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(useStore.getState().backModalSlot).toBe(null);
  });
});
