"""
API Endpoints para Historial de Transacciones
Consulta paginada y filtrada con autenticación JWT.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import Optional
from uuid import UUID
import math

from app.database import get_db
from app.auth import require_auth
from app.models import Transaccion, Activo
from app.models.usuario import Usuario
from app.schemas.transaccion_schemas import (
    TransaccionResponse,
    TransaccionListResponse,
)

router = APIRouter()


def _tx_to_response(tx: Transaccion) -> TransaccionResponse:
    """Convierte modelo Transaccion a schema de respuesta."""
    return TransaccionResponse(
        id_transaccion=str(tx.id_transaccion),
        id_usuario=str(tx.id_usuario),
        id_activo=str(tx.id_activo) if tx.id_activo else None,
        tipo_operacion=tx.tipo_operacion,
        cantidad=tx.cantidad,
        precio=tx.precio,
        comision=tx.comision,
        trm=tx.trm,
        monto_operacion=tx.monto_operacion,
        saldo_caja_antes=tx.saldo_caja_antes,
        saldo_caja_despues=tx.saldo_caja_despues,
        fecha_transaccion=tx.fecha_transaccion,
        id_lote=str(tx.id_lote) if tx.id_lote else None,
        url_evidencia=tx.url_evidencia,
        notas=tx.notas,
        ticker_activo=tx.activo.ticker if tx.activo else None,
        nombre_activo=tx.activo.nombre if tx.activo else None,
    )


@router.get("", response_model=TransaccionListResponse)
async def listar_transacciones(
    tipo: Optional[str] = Query(None, description="Filtrar por COMPRA, VENTA, etc."),
    id_activo: Optional[UUID] = Query(None, description="Filtrar por activo"),
    pagina: int = Query(1, ge=1, description="Número de página"),
    por_pagina: int = Query(20, ge=1, le=100, description="Registros por página"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_auth),
):
    """
    Lista las transacciones del usuario autenticado con paginación.

    Filtros opcionales: tipo de operación, activo específico.
    Ordenado por fecha descendente (más reciente primero).
    """
    query = db.query(Transaccion).filter(
        Transaccion.id_usuario == current_user.id_usuario
    )

    if tipo:
        query = query.filter(Transaccion.tipo_operacion == tipo.upper())
    if id_activo:
        query = query.filter(Transaccion.id_activo == id_activo)

    total = query.count()
    total_paginas = max(1, math.ceil(total / por_pagina))

    transacciones = (
        query
        .order_by(desc(Transaccion.fecha_transaccion))
        .offset((pagina - 1) * por_pagina)
        .limit(por_pagina)
        .all()
    )

    return TransaccionListResponse(
        items=[_tx_to_response(tx) for tx in transacciones],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=total_paginas,
    )
