import api from './api';
import type { TransaccionListResponse } from '../types';

/** Lista transacciones paginadas del usuario autenticado. */
export const listarTransacciones = async (params?: {
  tipo?: string;
  id_activo?: string;
  pagina?: number;
  por_pagina?: number;
}): Promise<TransaccionListResponse> => {
  const { data } = await api.get('/api/transacciones', { params });
  return data;
};
