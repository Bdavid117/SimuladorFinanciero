import api from './api';
import type {
  SaldoCaja,
  ResumenPortafolio,
  ValoracionDiaria,
} from '../types';

/** Obtiene el saldo de la caja de ahorros. */
export const obtenerSaldoCaja = async (): Promise<SaldoCaja> => {
  const { data } = await api.get('/api/portafolio/saldo');
  return data;
};

/** Obtiene resumen consolidado del portafolio. */
export const obtenerResumenPortafolio = async (): Promise<ResumenPortafolio> => {
  const { data } = await api.get('/api/portafolio/resumen');
  return data;
};

/** Lista valoraciones diarias históricas. */
export const listarValoraciones = async (): Promise<ValoracionDiaria[]> => {
  const { data } = await api.get('/api/portafolio/valoraciones');
  return data;
};

/** Genera un snapshot de valoración del portafolio para hoy. */
export const generarSnapshotValoracion = async (): Promise<ValoracionDiaria> => {
  const { data } = await api.post('/api/portafolio/valoraciones/snapshot');
  return data;
};
