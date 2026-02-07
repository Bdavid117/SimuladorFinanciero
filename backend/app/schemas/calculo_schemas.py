"""
Schemas Pydantic para Cálculos Financieros
"""
from pydantic import BaseModel, Field, UUID4
from decimal import Decimal
from datetime import date
from typing import Optional

class CalculoBonoRequest(BaseModel):
    """Request para calcular valoración de bono"""
    valor_nominal: Decimal = Field(..., gt=0, description="Valor nominal del bono")
    tasa_cupon: Decimal = Field(..., gt=0, le=100, description="Tasa de cupón anual (%)")
    frecuencia_cupon: int = Field(..., ge=1, le=12, description="Pagos al año (1, 2, 4)")
    tir: Decimal = Field(..., gt=0, le=100, description="Tasa Interna de Retorno deseada (%)")
    fecha_emision: date = Field(..., description="Fecha de emisión del bono")
    fecha_vencimiento: date = Field(..., description="Fecha de vencimiento del bono")
    fecha_valoracion: Optional[date] = Field(None, description="Fecha de valoración (default: hoy)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "valor_nominal": 1000000,
                "tasa_cupon": 7.25,
                "frecuencia_cupon": 2,
                "tir": 8.5,
                "fecha_emision": "2024-01-01",
                "fecha_vencimiento": "2030-01-01",
                "fecha_valoracion": "2026-02-06"
            }
        }

class CalculoBonoResponse(BaseModel):
    """Response con valoración de bono"""
    precio_limpio: Decimal
    cupon_acumulado: Decimal
    precio_sucio: Decimal
    cupon_periodo: Decimal
    num_periodos: int
    dias_desde_ultimo_cupon: int
    tir_utilizada: Decimal
    fecha_valoracion: date

class CalculoBonoActivoRequest(BaseModel):
    """Request para calcular bono desde activo existente"""
    id_activo: UUID4 = Field(..., description="UUID del activo (bono)")
    tir: Decimal = Field(..., gt=0, le=100, description="TIR deseada (%)")
    fecha_valoracion: Optional[date] = Field(None, description="Fecha de valoración")

class CalculoCDTRequest(BaseModel):
    """Request para calcular liquidación de CDT"""
    capital_invertido: Decimal = Field(..., gt=0, description="Capital inicial invertido")
    tasa_interes_anual: Decimal = Field(..., gt=0, le=100, description="Tasa de interés anual (%)")
    fecha_inicio: date = Field(..., description="Fecha de apertura del CDT")
    fecha_liquidacion: date = Field(..., description="Fecha de liquidación")
    plazo_dias_original: int = Field(..., gt=0, description="Plazo original en días")
    
    class Config:
        json_schema_extra = {
            "example": {
                "capital_invertido": 10000000,
                "tasa_interes_anual": 12.5,
                "fecha_inicio": "2025-11-01",
                "fecha_liquidacion": "2026-02-06",
                "plazo_dias_original": 90
            }
        }

class CalculoCDTResponse(BaseModel):
    """Response con liquidación de CDT"""
    capital_invertido: Decimal
    dias_transcurridos: int
    plazo_original: int
    es_liquidacion_anticipada: bool
    tasa_interes_anual: Decimal
    interes_bruto: Decimal
    penalizacion_porcentaje: float
    penalizacion_monto: Decimal
    interes_neto: Decimal
    monto_total_recibir: Decimal
    tasa_efectiva_anual: Decimal
    fecha_inicio: date
    fecha_liquidacion: date

class ConversionDivisaRequest(BaseModel):
    """Request para conversión de divisa"""
    cantidad: Decimal = Field(..., gt=0, description="Cantidad de activos")
    precio_unitario: Decimal = Field(..., gt=0, description="Precio en moneda extranjera")
    trm: Decimal = Field(..., gt=0, description="Tasa de cambio")
    comision: Decimal = Field(default=Decimal('0'), ge=0, description="Comisión")
    
    class Config:
        json_schema_extra = {
            "example": {
                "cantidad": 100,
                "precio_unitario": 150.25,
                "trm": 4800.00,
                "comision": 50000
            }
        }

class ConversionDivisaResponse(BaseModel):
    """Response con conversión de divisa"""
    cantidad: Decimal
    precio_unitario_extranjero: Decimal
    costo_extranjero: Decimal
    trm: Decimal
    costo_local_sin_comision: Decimal
    comision: Decimal
    costo_total: Decimal
    precio_unitario_local: Decimal

class CalificacionRequest(BaseModel):
    """Request para calcular calificación"""
    rendimiento_real: Decimal = Field(..., description="Rendimiento obtenido (0.15 = 15%)")
    meta_admin: Optional[Decimal] = Field(None, description="Meta del admin (se obtiene de BD si no se provee)")

class CalificacionResponse(BaseModel):
    """Response con calificación"""
    rendimiento_real: float
    meta_admin: float
    nota: float
    calificacion: str
    superó_meta: bool
