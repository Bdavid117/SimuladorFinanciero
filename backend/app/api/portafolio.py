"""
API Endpoints para Portafolio: saldo de caja, valoración y resumen consolidado.
Requiere autenticación JWT.
"""
from datetime import date
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import get_db
from app.auth import require_auth
from app.models import (
    CajaAhorros,
    Lote,
    ValoracionDiaria,
    EstadoLote,
)
from app.models.usuario import Usuario
from app.schemas.valoracion_schemas import (
    SaldoCajaResponse,
    ValoracionResponse,
    ResumenPortafolioResponse,
)

router = APIRouter()


# ── Saldo Caja de Ahorros ───────────────────────────────────────────
@router.get("/saldo", response_model=SaldoCajaResponse)
async def obtener_saldo_caja(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_auth),
):
    """Obtiene el saldo actual de la caja de ahorros del usuario."""
    caja = db.query(CajaAhorros).filter(
        CajaAhorros.id_usuario == current_user.id_usuario
    ).first()

    if not caja:
        raise HTTPException(status_code=404, detail="Caja de ahorros no encontrada")

    return SaldoCajaResponse(
        id_caja=str(caja.id_caja),
        saldo_actual=caja.saldo_actual,
        moneda=caja.moneda,
        fecha_actualizacion=caja.fecha_actualizacion,
    )


# ── Resumen consolidado ─────────────────────────────────────────────
@router.get("/resumen", response_model=ResumenPortafolioResponse)
async def obtener_resumen_portafolio(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_auth),
):
    """
    Genera un resumen consolidado del portafolio:
    - Saldo en caja
    - Inversión total (costo de lotes activos)
    - Valor estimado de mercado
    - Ganancia / Pérdida
    - Rentabilidad %
    """
    caja = db.query(CajaAhorros).filter(
        CajaAhorros.id_usuario == current_user.id_usuario
    ).first()
    saldo_caja = caja.saldo_actual if caja else Decimal("0")

    lotes = db.query(Lote).filter(
        and_(
            Lote.id_usuario == current_user.id_usuario,
            Lote.cantidad_disponible > 0,
        )
    ).all()

    inversion_total = sum(l.costo_total for l in lotes)
    # Valor de mercado estimado = último precio de compra × cantidad disponible
    # (aproximación; en producción se usaría precio de mercado real)
    valor_mercado = sum(
        l.precio_compra * l.cantidad_disponible * l.trm for l in lotes
    )

    ganancia = valor_mercado - inversion_total
    rentabilidad = float(
        (ganancia / inversion_total * 100) if inversion_total > 0 else 0
    )

    activos_unicos = len({str(l.id_activo) for l in lotes})

    return ResumenPortafolioResponse(
        saldo_caja=saldo_caja,
        inversion_total=inversion_total,
        valor_mercado_estimado=valor_mercado,
        ganancia_perdida=ganancia,
        rentabilidad_porcentaje=round(rentabilidad, 4),
        total_activos_diferentes=activos_unicos,
        total_lotes_activos=len(lotes),
    )


# ── Valoraciones históricas ─────────────────────────────────────────
@router.get("/valoraciones", response_model=List[ValoracionResponse])
async def listar_valoraciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_auth),
):
    """Lista el historial de valoraciones diarias del portafolio."""
    valoraciones = (
        db.query(ValoracionDiaria)
        .filter(ValoracionDiaria.id_usuario == current_user.id_usuario)
        .order_by(ValoracionDiaria.fecha_valoracion.desc())
        .limit(365)
        .all()
    )
    return [
        ValoracionResponse(
            id_valoracion=str(v.id_valoracion),
            fecha_valoracion=v.fecha_valoracion,
            valor_mercado_total=v.valor_mercado_total,
            costo_total_invertido=v.costo_total_invertido,
            ganancia_perdida=v.ganancia_perdida,
            rentabilidad_porcentaje=v.rentabilidad_porcentaje,
            efectivo_disponible=v.efectivo_disponible,
            fecha_calculo=v.fecha_calculo,
        )
        for v in valoraciones
    ]


# ── Generar snapshot de valoración ──────────────────────────────────
@router.post("/valoraciones/snapshot", response_model=ValoracionResponse, status_code=201)
async def generar_snapshot_valoracion(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_auth),
):
    """
    Toma una foto (snapshot) del estado actual del portafolio
    y la guarda como valoración diaria. Una por día por usuario.
    """
    hoy = date.today()

    # Verificar si ya existe para hoy
    existente = db.query(ValoracionDiaria).filter(
        and_(
            ValoracionDiaria.id_usuario == current_user.id_usuario,
            ValoracionDiaria.fecha_valoracion == hoy,
        )
    ).first()

    # Calcular valores
    caja = db.query(CajaAhorros).filter(
        CajaAhorros.id_usuario == current_user.id_usuario
    ).first()
    saldo = caja.saldo_actual if caja else Decimal("0")

    lotes = db.query(Lote).filter(
        and_(
            Lote.id_usuario == current_user.id_usuario,
            Lote.cantidad_disponible > 0,
        )
    ).all()

    costo_total = sum(l.costo_total for l in lotes)
    valor_mercado = sum(
        l.precio_compra * l.cantidad_disponible * l.trm for l in lotes
    )
    ganancia = valor_mercado - costo_total
    rentabilidad = (
        (ganancia / costo_total * 100) if costo_total > 0 else Decimal("0")
    )

    if existente:
        existente.valor_mercado_total = valor_mercado
        existente.costo_total_invertido = costo_total
        existente.ganancia_perdida = ganancia
        existente.rentabilidad_porcentaje = rentabilidad
        existente.efectivo_disponible = saldo
        db.commit()
        db.refresh(existente)
        v = existente
    else:
        v = ValoracionDiaria(
            id_usuario=current_user.id_usuario,
            fecha_valoracion=hoy,
            valor_mercado_total=valor_mercado,
            costo_total_invertido=costo_total,
            ganancia_perdida=ganancia,
            rentabilidad_porcentaje=rentabilidad,
            efectivo_disponible=saldo,
        )
        db.add(v)
        db.commit()
        db.refresh(v)

    return ValoracionResponse(
        id_valoracion=str(v.id_valoracion),
        fecha_valoracion=v.fecha_valoracion,
        valor_mercado_total=v.valor_mercado_total,
        costo_total_invertido=v.costo_total_invertido,
        ganancia_perdida=v.ganancia_perdida,
        rentabilidad_porcentaje=v.rentabilidad_porcentaje,
        efectivo_disponible=v.efectivo_disponible,
        fecha_calculo=v.fecha_calculo,
    )
