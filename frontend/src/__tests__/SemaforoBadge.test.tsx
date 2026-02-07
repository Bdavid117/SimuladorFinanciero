import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SemaforoBadge from '../components/ui/SemaforoBadge';

describe('SemaforoBadge', () => {
  it('muestra "Activo" para estado VERDE', () => {
    render(<SemaforoBadge estado="VERDE" />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('muestra "Parcial" para estado AMARILLO', () => {
    render(<SemaforoBadge estado="AMARILLO" />);
    expect(screen.getByText('Parcial')).toBeInTheDocument();
  });

  it('muestra "Agotado" para estado ROJO', () => {
    render(<SemaforoBadge estado="ROJO" />);
    expect(screen.getByText('Agotado')).toBeInTheDocument();
  });

  it('aplica tamaño sm correctamente', () => {
    const { container } = render(<SemaforoBadge estado="VERDE" size="sm" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-[10px]');
  });

  it('aplica tamaño md por defecto', () => {
    const { container } = render(<SemaforoBadge estado="ROJO" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-xs');
  });
});
