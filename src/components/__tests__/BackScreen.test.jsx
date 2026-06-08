import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../../store.js';

// Stub the SAE loader so the BackScreen tests can observe state transitions
// without the real loader's network calls or jsdom-incompatible behaviour.
vi.mock('../../lib/sae-loader.js', () => ({
  startSae: vi.fn(() => new Promise(() => {})), // never resolves
  stopSae: vi.fn(),
}));

import BackScreen from '../BackScreen.jsx';

beforeEach(() => {
  useStore.setState({
    // offsetY > 0 = backVisible so pointer-events are enabled during tests
    offsetY: 400,
    isDragging: false,
    saeStatus: 'off',
    bootToken: 0,
    saeProgress: 0,
    saeError: null,
  });
});

describe('BackScreen', () => {
  it('shows the power-on gadget when status is off', () => {
    render(<BackScreen />);
    expect(screen.getByTestId('crt-off')).toBeInTheDocument();
    expect(screen.getByTestId('power-on')).toBeInTheDocument();
  });

  it('clicking power-on transitions to loading and bumps bootToken', async () => {
    const user = userEvent.setup();
    render(<BackScreen />);
    await user.click(screen.getByTestId('power-on'));
    expect(useStore.getState().saeStatus).toBe('loading');
    expect(useStore.getState().bootToken).toBe(1);
    expect(screen.getByTestId('crt-loading')).toBeInTheDocument();
  });

  it('renders the running state with the gadget strip + sae mount; power off comes from PWR gadget', () => {
    useStore.setState({
      saeStatus: 'running',
      drives: {
        df0: { name: null, source: null, dirty: false },
        df1: { name: null, source: null, dirty: false },
        df2: { name: null, source: null, dirty: false },
        df3: { name: null, source: null, dirty: false },
        dh0: { name: null, source: null, dirty: false },
        dh1: { name: null, source: null, dirty: false },
      },
      leds: { power: true, df: [false, false, false, false], hd: false, fps: 50 },
    });
    render(<BackScreen />);
    expect(screen.getByTestId('sae-mount')).toBeInTheDocument();
    expect(screen.getByTestId('led-panel')).toBeInTheDocument();
    expect(screen.getByTestId('gadget-power')).toBeInTheDocument();
  });

  it('error state shows Software Failure with Retry / Cancel', async () => {
    useStore.setState({ saeStatus: 'error', saeError: new Error('ROM 404') });
    const user = userEvent.setup();
    render(<BackScreen />);
    expect(screen.getByTestId('software-failure')).toContainHTML('ROM 404');
    await user.click(screen.getByTestId('sf-cancel'));
    expect(useStore.getState().saeStatus).toBe('off');
  });

  it('Retry from error re-enters loading and bumps bootToken', async () => {
    useStore.setState({
      saeStatus: 'error',
      saeError: new Error('flaky network'),
      bootToken: 5,
    });
    const user = userEvent.setup();
    render(<BackScreen />);
    await user.click(screen.getByTestId('sf-retry'));
    expect(useStore.getState().saeStatus).toBe('loading');
    expect(useStore.getState().bootToken).toBe(6);
  });
});
