"""
Schemas Pydantic para Lotes
"""
from pydantic import BaseModel, Field, UUID4
from decimal import Decimal
from datetime import datetime
from typing import Optional

class LoteCompraRequest(BaseModel):
    """Request para comprar un activo (crear lote)"""
    id_usuario: UUID4 = Field(..., description="UUID del usuario")
    id_activo: UUID4 = Field(..., description="UUID del activo a comprar")
    cantidad: Decimal = Field(..., gt=0, description="Cantidad de activos a comprar")
    precio_compra: Decimal = Field(..., gt=0, description="Precio unitario de compra")
    comision: Decimal = Field(default=Decimal('0'), ge=0, description="Comisión de la operación")
    trm: Decimal = Field(default=Decimal('1'), gt=0, description="Tasa de cambio (para activos extranjeros)")
    url_evidencia: Optional[str] = Field(None, description="URL de screenshot del precio")
    notas: Optional[str] = Field(None, description="Notas adicionales")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id_usuario": "550e8400-e29b-41d4-a716-446655440000",
                "id_activo": "660e8400-e29b-41d4-a716-446655440000",
                "cantidad": 100,
                "precio_compra": 25000,
                "comision": 250,
                "trm": 1.0,
                "url_evidencia": "https://ejemplo.com/screenshot.png",
                "notas": "Compra de acciones de Ecopetrol"
            }
        }

class LoteVentaRequest(BaseModel):
    """Request para vender un activo (desde lotes)"""
    id_usuario: UUID4 = Field(..., description="UUID del usuario")
    id_activo: UUID4 = Field(..., description="UUID del activo a vender")
    cantidad: Decimal = Field(..., gt=0, description="Cantidad a vender")
    precio_venta: Decimal = Field(..., gt=0, description="Precio unitario de venta")
    comision: Decimal = Field(default=Decimal('0'), ge=0, description="Comisión de la operación")
    trm: Decimal = Field(default=Decimal('1'), gt=0, description="Tasa de cambio")
    url_evidencia: Optional[str] = Field(None, description="URL de evidencia")
    notas: Optional[str] = Field(None, description="Notas adicionales")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id_usuario": "550e8400-e29b-41d4-a716-446655440000",
                "id_activo": "660e8400-e29b-41d4-a716-446655440000",
                "cantidad": 50,
                "precio_venta": 27000,
                "comision": 270,
                "trm": 1.0
            }
        }

class LoteResponse(BaseModel):
    """Response con información de un lote"""
    id_lote: UUID4
    id_usuario: UUID4
    id_activo: UUID4
    cantidad_inicial: Decimal
    cantidad_disponible: Decimal
    precio_compra: Decimal
    comision_compra: Decimal
    trm: Decimal
    costo_total: Decimal
    fecha_compra: datetime
    estado: str
    url_evidencia: Optional[str]
    porcentaje_disponible: float
    
    class Config:
        from_attributes = True

class EstadisticasLotesResponse(BaseModel):
    """Response con estadísticas de lotes"""
    total_lotes: int
    lotes_verdes: int
    lotes_amarillos: int
    lotes_rojos: int
    porcentaje_verde: float
    porcentaje_amarillo: float
    porcentaje_rojo: float
    inversion_total: Decimal
    cantidad_disponible_total: Decimal
