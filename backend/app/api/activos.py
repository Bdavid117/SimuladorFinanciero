"""
API Endpoints para gestión de Activos Financieros
CRUD completo con autenticación JWT.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.auth import require_auth
from app.models import Activo, TipoActivo
from app.models.usuario import Usuario
from app.schemas.activo_schemas import (
    ActivoCreateRequest,
    ActivoUpdateRequest,
    ActivoResponse,
    TipoActivoResponse,
)

router = APIRouter()


def _activo_to_response(activo: Activo) -> ActivoResponse:
    """Convierte un modelo Activo a schema de respuesta."""
    return ActivoResponse(
        id_activo=str(activo.id_activo),
        id_tipo_activo=activo.id_tipo_activo,
        ticker=activo.ticker,
        nombre=activo.nombre,
        moneda=activo.moneda,
        mercado=activo.mercado,
        es_extranjero=activo.es_extranjero,
        activo=activo.activo,
        valor_nominal=activo.valor_nominal,
        tasa_cupon=activo.tasa_cupon,
        frecuencia_cupon=activo.frecuencia_cupon,
        fecha_emision=activo.fecha_emision,
        fecha_vencimiento=activo.fecha_vencimiento,
        tasa_interes_anual=activo.tasa_interes_anual,
        plazo_dias=activo.plazo_dias,
        tipo_nombre=activo.tipo_activo.nombre if activo.tipo_activo else None,
    )


# ── Tipos de Activo ─────────────────────────────────────────────────
@router.get("/tipos", response_model=List[TipoActivoResponse])
async def listar_tipos_activo(
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(require_auth),
):
    """Lista todos los tipos de activo disponibles."""
    tipos = db.query(TipoActivo).filter(TipoActivo.activo.is_(True)).all()
    return tipos


# ── CRUD Activos ─────────────────────────────────────────────────────
@router.get("", response_model=List[ActivoResponse])
async def listar_activos(
    solo_activos: bool = Query(True, description="Solo activos habilitados"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (BONO, CDT, ACCION…)"),
    buscar: Optional[str] = Query(None, description="Buscar por ticker o nombre"),
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(require_auth),
):
    """Lista activos con filtros opcionales."""
    query = db.query(Activo).join(TipoActivo)

    if solo_activos:
        query = query.filter(Activo.activo.is_(True))
    if tipo:
        query = query.filter(TipoActivo.nombre == tipo.upper())
    if buscar:
        pattern = f"%{buscar}%"
        query = query.filter(
            (Activo.ticker.ilike(pattern)) | (Activo.nombre.ilike(pattern))
        )

    activos = query.order_by(Activo.ticker).all()
    return [_activo_to_response(a) for a in activos]


@router.get("/{id_activo}", response_model=ActivoResponse)
async def obtener_activo(
    id_activo: UUID,
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(require_auth),
):
    """Obtiene un activo por su ID."""
    activo = db.query(Activo).filter(Activo.id_activo == id_activo).first()
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    return _activo_to_response(activo)


@router.post("", response_model=ActivoResponse, status_code=status.HTTP_201_CREATED)
async def crear_activo(
    body: ActivoCreateRequest,
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(require_auth),
):
    """Crea un nuevo activo financiero."""
    # Validar tipo
    tipo = db.query(TipoActivo).filter(
        TipoActivo.id_tipo_activo == body.id_tipo_activo
    ).first()
    if not tipo:
        raise HTTPException(status_code=400, detail="Tipo de activo no encontrado")

    # Validar ticker único
    existente = db.query(Activo).filter(Activo.ticker == body.ticker.upper()).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un activo con ticker '{body.ticker.upper()}'",
        )

    activo = Activo(
        id_tipo_activo=body.id_tipo_activo,
        ticker=body.ticker.upper(),
        nombre=body.nombre,
        moneda=body.moneda.upper(),
        mercado=body.mercado,
        es_extranjero=body.es_extranjero,
        valor_nominal=body.valor_nominal,
        tasa_cupon=body.tasa_cupon,
        frecuencia_cupon=body.frecuencia_cupon,
        fecha_emision=body.fecha_emision,
        fecha_vencimiento=body.fecha_vencimiento,
        tasa_interes_anual=body.tasa_interes_anual,
        plazo_dias=body.plazo_dias,
    )
    db.add(activo)
    db.commit()
    db.refresh(activo)

    return _activo_to_response(activo)


@router.put("/{id_activo}", response_model=ActivoResponse)
async def actualizar_activo(
    id_activo: UUID,
    body: ActivoUpdateRequest,
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(require_auth),
):
    """Actualiza un activo existente (solo campos enviados)."""
    activo = db.query(Activo).filter(Activo.id_activo == id_activo).first()
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    update_data = body.model_dump(exclude_unset=True)
    if "ticker" in update_data:
        update_data["ticker"] = update_data["ticker"].upper()

    for campo, valor in update_data.items():
        setattr(activo, campo, valor)

    db.commit()
    db.refresh(activo)
    return _activo_to_response(activo)


@router.delete("/{id_activo}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_activo(
    id_activo: UUID,
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(require_auth),
):
    """Desactiva (soft-delete) un activo."""
    activo = db.query(Activo).filter(Activo.id_activo == id_activo).first()
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")

    activo.activo = False
    db.commit()
    return None
