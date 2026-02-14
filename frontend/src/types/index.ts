// =====================================================================
// TIPOS TYPESCRIPT - Simulador de Portafolio de Inversiones
// Mapeados exactamente a los schemas Pydantic del backend
// =====================================================================

export type EstadoLote = 'VERDE' | 'AMARILLO' | 'ROJO';

// --- Lotes: Request ---
export interface CompraRequest {
  id_usuario: string;
  id_activo: string;
  cantidad: number;
  precio_compra: number;
  comision?: number;
  trm?: number;
  url_evidencia?: string;
  notas?: string;
}

export interface VentaRequest {
  id_usuario: string;
  id_activo: string;
  cantidad: number;
  precio_venta: number;
  comision?: number;
  trm?: number;
  url_evidencia?: string;
  notas?: string;
}

// --- Lotes: Response ---
export interface LoteResponse {
  id_lote: string;
  id_usuario: string;
  id_activo: string;
  cantidad_inicial: number;
  cantidad_disponible: number;
  precio_compra: number;
  comision_compra: number;
  trm: number;
  costo_total: number;
  fecha_compra: string;
  estado: EstadoLote;
  url_evidencia?: string;
  porcentaje_disponible: number;
}

export interface DashboardResponse {
  total_lotes: number;
  lotes_verdes: number;
  lotes_amarillos: number;
  lotes_rojos: number;
  porcentaje_verde: number;
  porcentaje_amarillo: number;
  porcentaje_rojo: number;
  inversion_total: number;
  cantidad_disponible_total: number;
}

// --- Calculos Financieros ---
export interface BonoRequest {
  valor_nominal: number;
  tasa_cupon: number;
  frecuencia_cupon: number;
  tir: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_valoracion?: string;
}

export interface BonoResponse {
  precio_limpio: number;
  cupon_acumulado: number;
  precio_sucio: number;
  cupon_periodo: number;
  num_periodos: number;
  dias_desde_ultimo_cupon: number;
  tir_utilizada: number;
  fecha_valoracion: string;
}

export interface CDTRequest {
  capital_invertido: number;
  tasa_interes_anual: number;
  fecha_inicio: string;
  fecha_liquidacion: string;
  plazo_dias_original: number;
}

export interface CDTResponse {
  capital_invertido: number;
  dias_transcurridos: number;
  plazo_original: number;
  es_liquidacion_anticipada: boolean;
  tasa_interes_anual: number;
  interes_bruto: number;
  penalizacion_porcentaje: number;
  penalizacion_monto: number;
  interes_neto: number;
  monto_total_recibir: number;
  tasa_efectiva_anual: number;
  fecha_inicio: string;
  fecha_liquidacion: string;
}

export interface DivisaRequest {
  cantidad: number;
  precio_unitario: number;
  trm: number;
  comision?: number;
}

export interface DivisaResponse {
  cantidad: number;
  precio_unitario_extranjero: number;
  costo_extranjero: number;
  trm: number;
  costo_local_sin_comision: number;
  comision: number;
  costo_total: number;
  precio_unitario_local: number;
}

export interface CalificacionRequest {
  rendimiento_real: number;
  meta_admin?: number;
}

export interface CalificacionResponse {
  rendimiento_real: number;
  meta_admin: number;
  nota: number;
  calificacion: string;
  'superó_meta': boolean;
}

// --- Activos Financieros ---
export interface TipoActivo {
  id_tipo_activo: number;
  nombre: string;
  descripcion?: string;
  requiere_trm: boolean;
  activo: boolean;
}

export interface Activo {
  id_activo: string;
  id_tipo_activo: number;
  ticker: string;
  nombre: string;
  moneda: string;
  mercado?: string;
  es_extranjero: boolean;
  activo: boolean;
  valor_nominal?: number;
  tasa_cupon?: number;
  frecuencia_cupon?: number;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  tasa_interes_anual?: number;
  plazo_dias?: number;
  tipo_nombre?: string;
}

export interface ActivoCreateRequest {
  id_tipo_activo: number;
  ticker: string;
  nombre: string;
  moneda?: string;
  mercado?: string;
  es_extranjero?: boolean;
  valor_nominal?: number;
  tasa_cupon?: number;
  frecuencia_cupon?: number;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  tasa_interes_anual?: number;
  plazo_dias?: number;
}

// --- Transacciones ---
export interface TransaccionItem {
  id_transaccion: string;
  id_usuario: string;
  id_activo?: string;
  tipo_operacion: string;
  cantidad: number;
  precio?: number;
  comision: number;
  trm: number;
  monto_operacion: number;
  saldo_caja_antes?: number;
  saldo_caja_despues?: number;
  fecha_transaccion: string;
  id_lote?: string;
  url_evidencia?: string;
  notas?: string;
  ticker_activo?: string;
  nombre_activo?: string;
}

export interface TransaccionListResponse {
  items: TransaccionItem[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

// --- Portafolio ---
export interface SaldoCaja {
  id_caja: string;
  saldo_actual: number;
  moneda: string;
  fecha_actualizacion?: string;
}

export interface ResumenPortafolio {
  saldo_caja: number;
  inversion_total: number;
  valor_mercado_estimado: number;
  ganancia_perdida: number;
  rentabilidad_porcentaje: number;
  total_activos_diferentes: number;
  total_lotes_activos: number;
}

export interface ValoracionDiaria {
  id_valoracion: string;
  fecha_valoracion: string;
  valor_mercado_total: number;
  costo_total_invertido: number;
  ganancia_perdida?: number;
  rentabilidad_porcentaje?: number;
  efectivo_disponible?: number;
  fecha_calculo?: string;
}
