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
  });
});

describe('LedPanel', () => {
  it('returns null when saeStatus is off', () => {
    useStore.setState({ saeStatus: 'off' });
    const { container } = render(<LedPanel />);
    expect(container.firstChild).toBe(null);
  });

  it('renders power + 4 floppy + HD LEDs and FPS counter', () => {
    render(<LedPanel />);
    expect(screen.getByTestId('led-power')).toBeInTheDocument();
    expect(screen.getByTestId('led-df0')).toBeInTheDocument();
    expect(screen.getByTestId('led-df3')).toBeInTheDocument();
    expect(screen.getByTestId('led-hd')).toBeInTheDocument();
    expect(screen.getByTestId('led-fps')).toHaveTextContent('0 fps');
  });

  it('reflects led state changes', () => {
    useStore.setState({
      leds: { power: true, df: [true, false, false, false], hd: true, fps: 50 },
    });
    render(<LedPanel />);
    expect(screen.getByTestId('led-power').querySelector('.led-dot')).toHaveAttribute(
      'data-on',
    );
    expect(screen.getByTestId('led-df0').querySelector('.led-dot')).toHaveAttribute(
      'data-on',
    );
    expect(screen.getByTestId('led-df1').querySelector('.led-dot')).not.toHaveAttribute(
      'data-on',
    );
    expect(screen.getByTestId('led-fps')).toHaveTextContent('50 fps');
  });
});
