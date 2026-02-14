"""
Schemas Pydantic para Valoraciones del Portafolio
"""
from pydantic import BaseModel
from decimal import Decimal
from datetime import date, datetime
from typing import Optional


class ValoracionResponse(BaseModel):
    """Respuesta con una valoración diaria del portafolio."""
    id_valoracion: str
    fecha_valoracion: date
    valor_mercado_total: Decimal
    costo_total_invertido: Decimal
    ganancia_perdida: Optional[Decimal] = None
    rentabilidad_porcentaje: Optional[Decimal] = None
    efectivo_disponible: Optional[Decimal] = None
    fecha_calculo: Optional[datetime] = None

    class Config:
        from_attributes = True


class SaldoCajaResponse(BaseModel):
    """Respuesta con saldo de caja de ahorros."""
    id_caja: str
    saldo_actual: Decimal
    moneda: str
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResumenPortafolioResponse(BaseModel):
    """Resumen consolidado del portafolio."""
    saldo_caja: Decimal
    inversion_total: Decimal
    valor_mercado_estimado: Decimal
    ganancia_perdida: Decimal
    rentabilidad_porcentaje: float
    total_activos_diferentes: int
    total_lotes_activos: int
