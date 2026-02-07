import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../components/ui/StatCard';

describe('StatCard', () => {
  it('renderiza título y valor', () => {
    render(<StatCard title="Total Lotes" value={42} />);
    expect(screen.getByText('Total Lotes')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renderiza subtitle cuando se proporciona', () => {
    render(<StatCard title="X" value="$1M" subtitle="Capital invertido" />);
    expect(screen.getByText('Capital invertido')).toBeInTheDocument();
  });

  it('renderiza trend positivo', () => {
    render(<StatCard title="X" value="100" trend={{ value: '12%', positive: true }} />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renderiza trend negativo', () => {
    render(<StatCard title="X" value="100" trend={{ value: '5%', positive: false }} />);
    expect(screen.getByText('5%')).toBeInTheDocument();
  });
});
