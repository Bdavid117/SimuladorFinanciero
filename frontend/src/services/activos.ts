import api from './api';
import type {
  Activo,
  ActivoCreateRequest,
  TipoActivo,
} from '../types';

/** Lista todos los tipos de activo. */
export const listarTiposActivo = async (): Promise<TipoActivo[]> => {
  const { data } = await api.get('/api/activos/tipos');
  return data;
};

/** Lista activos con filtros opcionales. */
export const listarActivos = async (params?: {
  solo_activos?: boolean;
  tipo?: string;
  buscar?: string;
}): Promise<Activo[]> => {
  const { data } = await api.get('/api/activos', { params });
  return data;
};

/** Obtiene un activo por ID. */
export const obtenerActivo = async (id: string): Promise<Activo> => {
  const { data } = await api.get(`/api/activos/${id}`);
  return data;
};

/** Crea un nuevo activo. */
export const crearActivo = async (body: ActivoCreateRequest): Promise<Activo> => {
  const { data } = await api.post('/api/activos', body);
  return data;
};

/** Actualiza un activo existente. */
export const actualizarActivo = async (
  id: string,
  body: Partial<ActivoCreateRequest & { activo: boolean }>
): Promise<Activo> => {
  const { data } = await api.put(`/api/activos/${id}`, body);
  return data;
};

/** Elimina (soft-delete) un activo. */
export const eliminarActivo = async (id: string): Promise<void> => {
  await api.delete(`/api/activos/${id}`);
};
