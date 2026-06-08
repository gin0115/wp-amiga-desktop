import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('App scaffold', () => {
  it('renders the Workbench placeholder', () => {
    render(<App />);
    expect(screen.getByText('Workbench 3.1')).toBeInTheDocument();
    expect(screen.getByText('scaffolding online')).toBeInTheDocument();
  });
});
