import { describe, it, expect } from 'vitest';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

// Mock URL.createObjectURL & URL.revokeObjectURL
globalThis.URL.createObjectURL = () => 'blob:mock';
globalThis.URL.revokeObjectURL = () => {};

describe('exportUtils', () => {
  it('exportToCSV genera blob descargable sin errores', () => {
    // No debería lanzar error
    const data = [
      { nombre: 'TEST', inversion: 1000000 },
      { nombre: 'OTRO', inversion: 2000000 },
    ];
    expect(() => exportToCSV(data, 'test')).not.toThrow();
  });

  it('exportToJSON genera blob descargable sin errores', () => {
    const data = [{ id: 1, valor: 'abc' }];
    expect(() => exportToJSON(data, 'test')).not.toThrow();
  });

  it('exportToCSV maneja datos vacíos', () => {
    expect(() => exportToCSV([], 'empty')).not.toThrow();
  });
});
