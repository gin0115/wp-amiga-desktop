import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import LedPanel from '../LedPanel.jsx';
import { useStore } from '../../store.js';

beforeEach(() => {
  useStore.setState({
    saeStatus: 'running',
    leds: {
      power: false,
      df: [false, false, false, false],
      hd: false,
      fps: 0,
    },
    drives: {
      df0: { name: null, source: null, dirty: false },
      df1: { name: null, source: null, dirty: false },
      df2: { name: null, source: null, dirty: false },
      df3: { name: null, source: null, dirty: false },
      dh0: { name: null, source: null, dirty: false },
      dh1: { name: null, source: null, dirty: false },
    },
    backModalSlot: null,
  });
});

describe('LedPanel (gadget strip)', () => {
  it('returns null when saeStatus is off', () => {
    useStore.setState({ saeStatus: 'off' });
    const { container } = render(<LedPanel />);
    expect(container.firstChild).toBe(null);
  });

  it('renders PWR + DF0-3 + DH0-1 gadgets and FPS counter, no CD', () => {
    render(<LedPanel />);
    expect(screen.getByTestId('gadget-power')).toBeInTheDocument();
    expect(screen.getByTestId('gadget-df0')).toBeInTheDocument();
    expect(screen.getByTestId('gadget-df3')).toBeInTheDocument();
    expect(screen.getByTestId('gadget-dh0')).toBeInTheDocument();
    expect(screen.getByTestId('gadget-dh1')).toBeInTheDocument();
    expect(screen.queryByTestId('gadget-cd0')).toBeNull();
    expect(screen.getByTestId('led-fps')).toHaveTextContent('0 fps');
  });

  it('LED corner dot lights when activity is true', () => {
    useStore.setState({
      leds: { power: true, df: [true, false, false, false], hd: true, fps: 50 },
    });
    render(<LedPanel />);
    expect(
      screen.getByTestId('gadget-power').querySelector('.drive-gadget-led'),
    ).toHaveAttribute('data-on');
    expect(
      screen.getByTestId('gadget-df0').querySelector('.drive-gadget-led'),
    ).toHaveAttribute('data-on');
    expect(
      screen.getByTestId('gadget-df1').querySelector('.drive-gadget-led'),
    ).not.toHaveAttribute('data-on');
    expect(
      screen.getByTestId('gadget-dh0').querySelector('.drive-gadget-led'),
    ).toHaveAttribute('data-on');
    expect(screen.getByTestId('led-fps')).toHaveTextContent('50 fps');
  });

  it('drive state is "mounted" when drives[slot].name is set, "empty" otherwise', () => {
    useStore.setState({
      drives: {
        ...useStore.getState().drives,
        df0: { name: 'bootdisk.adf', source: null, dirty: false },
      },
    });
    render(<LedPanel />);
    expect(screen.getByTestId('gadget-df0')).toHaveAttribute(
      'data-state',
      'mounted',
    );
    expect(screen.getByTestId('gadget-df1')).toHaveAttribute(
      'data-state',
      'empty',
    );
  });
});
