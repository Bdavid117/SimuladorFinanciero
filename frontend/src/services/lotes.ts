import api, { DEMO_USER_ID } from './api';
import type {
  CompraRequest,
  VentaRequest,
  LoteResponse,
  DashboardResponse,
} from '../types';

// --- Lotes ---
export const comprarActivo = async (data: CompraRequest) => {
  const response = await api.post('/api/lotes/comprar', data);
  return response.data;
};

export const venderActivo = async (data: VentaRequest) => {
  const response = await api.post('/api/lotes/vender', data);
  return response.data;
};

export const listarLotes = async (
  idUsuario: string = DEMO_USER_ID,
  soloDisponibles: boolean = false,
  idActivo?: string
): Promise<LoteResponse[]> => {
  const params: Record<string, string | boolean> = {};
  if (soloDisponibles) params.solo_disponibles = true;
  if (idActivo) params.id_activo = idActivo;
  const response = await api.get(`/api/lotes/usuario/${idUsuario}`, { params });
  return response.data;
};

export const obtenerResumen = async (
  idUsuario: string = DEMO_USER_ID
): Promise<Record<string, unknown>[]> => {
  const response = await api.get(`/api/lotes/usuario/${idUsuario}/resumen`);
  return response.data;
};

export const obtenerDashboard = async (
  idUsuario: string = DEMO_USER_ID
): Promise<DashboardResponse> => {
  const response = await api.get(`/api/lotes/usuario/${idUsuario}/estadisticas`);
  return response.data;
};
