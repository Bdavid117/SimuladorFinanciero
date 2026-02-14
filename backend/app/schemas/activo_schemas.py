"""
Schemas Pydantic para Activos Financieros
"""
from pydantic import BaseModel, Field, UUID4
from decimal import Decimal
from datetime import date
from typing import Optional, List


# ── Tipos de Activo ──────────────────────────────────────────────────
class TipoActivoResponse(BaseModel):
    """Respuesta con información de un tipo de activo."""
    id_tipo_activo: int
    nombre: str
    descripcion: Optional[str] = None
    requiere_trm: bool
    activo: bool

    class Config:
        from_attributes = True


# ── Activos ──────────────────────────────────────────────────────────
class ActivoCreateRequest(BaseModel):
    """Request para crear un activo financiero."""
    id_tipo_activo: int = Field(..., description="ID del tipo de activo")
    ticker: str = Field(..., min_length=1, max_length=20, description="Símbolo del activo")
    nombre: str = Field(..., min_length=1, max_length=200, description="Nombre completo")
    moneda: str = Field(default="COP", max_length=3, description="Código de moneda ISO")
    mercado: Optional[str] = Field(None, max_length=50, description="Mercado donde cotiza")
    es_extranjero: bool = Field(default=False, description="¿Es un activo extranjero?")

    # Campos para bonos
    valor_nominal: Optional[Decimal] = Field(None, gt=0, description="Valor nominal (bonos)")
    tasa_cupon: Optional[Decimal] = Field(None, ge=0, le=100, description="Tasa cupón anual % (bonos)")
    frecuencia_cupon: Optional[int] = Field(None, ge=1, le=12, description="Pagos/año (bonos)")
    fecha_emision: Optional[date] = Field(None, description="Fecha emisión (bonos)")
    fecha_vencimiento: Optional[date] = Field(None, description="Fecha vencimiento (bonos)")

    # Campos para CDTs
    tasa_interes_anual: Optional[Decimal] = Field(None, ge=0, le=100, description="Tasa interés anual % (CDTs)")
    plazo_dias: Optional[int] = Field(None, gt=0, description="Plazo en días (CDTs)")

    class Config:
        json_schema_extra = {
            "example": {
                "id_tipo_activo": 1,
                "ticker": "ECOPETROL",
                "nombre": "Ecopetrol S.A.",
                "moneda": "COP",
                "mercado": "BVC",
                "es_extranjero": False,
            }
        }


class ActivoUpdateRequest(BaseModel):
    """Request para actualizar un activo (campos opcionales)."""
    ticker: Optional[str] = Field(None, min_length=1, max_length=20)
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    moneda: Optional[str] = Field(None, max_length=3)
    mercado: Optional[str] = None
    es_extranjero: Optional[bool] = None
    activo: Optional[bool] = None

    valor_nominal: Optional[Decimal] = Field(None, gt=0)
    tasa_cupon: Optional[Decimal] = Field(None, ge=0, le=100)
    frecuencia_cupon: Optional[int] = Field(None, ge=1, le=12)
    fecha_emision: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    tasa_interes_anual: Optional[Decimal] = Field(None, ge=0, le=100)
    plazo_dias: Optional[int] = Field(None, gt=0)


class ActivoResponse(BaseModel):
    """Respuesta con información completa de un activo."""
    id_activo: str
    id_tipo_activo: int
    ticker: str
    nombre: str
    moneda: str
    mercado: Optional[str] = None
    es_extranjero: bool
    activo: bool

    # Campos bonos
    valor_nominal: Optional[Decimal] = None
    tasa_cupon: Optional[Decimal] = None
    frecuencia_cupon: Optional[int] = None
    fecha_emision: Optional[date] = None
    fecha_vencimiento: Optional[date] = None

    # Campos CDTs
    tasa_interes_anual: Optional[Decimal] = None
    plazo_dias: Optional[int] = None

    # Tipo (join)
    tipo_nombre: Optional[str] = None

    class Config:
        from_attributes = True
