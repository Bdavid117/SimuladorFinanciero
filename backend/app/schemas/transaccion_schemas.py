"""
Schemas Pydantic para Transacciones
"""
from pydantic import BaseModel, Field, UUID4
from decimal import Decimal
from datetime import datetime
from typing import Optional, List


class TransaccionResponse(BaseModel):
    """Respuesta con información de una transacción."""
    id_transaccion: str
    id_usuario: str
    id_activo: Optional[str] = None
    tipo_operacion: str
    cantidad: Decimal
    precio: Optional[Decimal] = None
    comision: Decimal = Decimal("0")
    trm: Decimal = Decimal("1")
    monto_operacion: Decimal
    saldo_caja_antes: Optional[Decimal] = None
    saldo_caja_despues: Optional[Decimal] = None
    fecha_transaccion: datetime
    id_lote: Optional[str] = None
    url_evidencia: Optional[str] = None
    notas: Optional[str] = None

    # Datos de join
    ticker_activo: Optional[str] = None
    nombre_activo: Optional[str] = None

    class Config:
        from_attributes = True


class TransaccionListResponse(BaseModel):
    """Respuesta paginada de transacciones."""
    items: List[TransaccionResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int
