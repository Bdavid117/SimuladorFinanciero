import api from './api';
import type {
  CompraRequest,
  VentaRequest,
  LoteResponse,
  DashboardResponse,
} from '../types';

function getUserId(): string {
  const user = localStorage.getItem('user');
  if (user) {
    try { return JSON.parse(user).id_usuario; } catch { /* noop */ }
  }
  return '550e8400-e29b-41d4-a716-446655440000'; // fallback demo
}

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
  idUsuario?: string,
  soloDisponibles: boolean = false,
  idActivo?: string
): Promise<LoteResponse[]> => {
  const uid = idUsuario || getUserId();
  const params: Record<string, string | boolean> = {};
  if (soloDisponibles) params.solo_disponibles = true;
  if (idActivo) params.id_activo = idActivo;
  const response = await api.get(`/api/lotes/usuario/${uid}`, { params });
  return response.data;
};

export const obtenerResumen = async (
  idUsuario?: string
): Promise<Record<string, unknown>[]> => {
  const uid = idUsuario || getUserId();
  const response = await api.get(`/api/lotes/usuario/${uid}/resumen`);
  return response.data;
};

export const obtenerDashboard = async (
  idUsuario?: string
): Promise<DashboardResponse> => {
  const uid = idUsuario || getUserId();
  const response = await api.get(`/api/lotes/usuario/${uid}/estadisticas`);
  return response.data;
};
