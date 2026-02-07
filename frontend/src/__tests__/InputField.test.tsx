import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../components/ui/InputField';

describe('InputField', () => {
  it('renderiza el label correctamente', () => {
    render(
      <InputField label="Nombre" value="" onChange={() => {}} />
    );
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('muestra asterisco cuando es required', () => {
    render(
      <InputField label="Email" value="" onChange={() => {}} required />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('llama onChange al escribir', () => {
    const handleChange = vi.fn();
    render(
      <InputField label="Test" value="" onChange={handleChange} />
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'nuevo' } });
    expect(handleChange).toHaveBeenCalledWith('nuevo');
  });

  it('muestra prefix y suffix', () => {
    render(
      <InputField label="Precio" value="100" onChange={() => {}} prefix="$" suffix="COP" />
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('COP')).toBeInTheDocument();
  });

  it('muestra helpText', () => {
    render(
      <InputField label="X" value="" onChange={() => {}} helpText="Texto de ayuda" />
    );
    expect(screen.getByText('Texto de ayuda')).toBeInTheDocument();
  });
});
