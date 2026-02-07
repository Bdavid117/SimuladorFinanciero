import api from './api';
import type {
  BonoRequest,
  BonoResponse,
  CDTRequest,
  CDTResponse,
  DivisaRequest,
  DivisaResponse,
  CalificacionRequest,
  CalificacionResponse,
} from '../types';

export const calcularBono = async (data: BonoRequest): Promise<BonoResponse> => {
  const response = await api.post('/api/calculos/bono/precio-sucio', data);
  return response.data;
};

export const liquidarCDT = async (data: CDTRequest): Promise<CDTResponse> => {
  const response = await api.post('/api/calculos/cdt/liquidar', data);
  return response.data;
};

export const convertirDivisa = async (data: DivisaRequest): Promise<DivisaResponse> => {
  const response = await api.post('/api/calculos/divisa/convertir', data);
  return response.data;
};

export const calcularCalificacion = async (
  data: CalificacionRequest
): Promise<CalificacionResponse> => {
  const response = await api.post('/api/calculos/calificacion', data);
  return response.data;
};
