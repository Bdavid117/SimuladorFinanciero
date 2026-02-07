"""
API Endpoints para Gestión de Lotes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from uuid import UUID

from app.database import get_db
from app.services.lote_service import LoteService
from app.schemas.lote_schemas import (
    LoteCompraRequest, LoteVentaRequest,
    LoteResponse, EstadisticasLotesResponse
)

router = APIRouter()

@router.post("/comprar", response_model=Dict)
async def comprar_activo(
    request: LoteCompraRequest,
    db: Session = Depends(get_db)
):
    """
    **🟢 Compra de Activo - Crea un nuevo Lote**
    
    ### Proceso:
    1. Valida saldo suficiente en caja de ahorros
    2. Calcula costo total: `(cantidad × precio × TRM) + comisión`
    3. Resta dinero de la caja
    4. Crea lote en estado **VERDE** (100% disponible)
    5. Registra transacción de compra
    
    ### Sistema de Estados:
    - 🟢 **VERDE**: Lote completo disponible
    - 🟡 **AMARILLO**: Lote parcialmente vendido
    - 🔴 **ROJO**: Lote totalmente vendido
    
    ### Evidencia:
    Puedes adjuntar una URL de screenshot del precio de compra
    """
    try:
        resultado = LoteService.comprar_activo(
            db=db,
            id_usuario=request.id_usuario,
            id_activo=request.id_activo,
            cantidad=request.cantidad,
            precio_compra=request.precio_compra,
            comision=request.comision,
            trm=request.trm,
            url_evidencia=request.url_evidencia,
            notas=request.notas
        )
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/vender", response_model=Dict)
async def vender_activo(
    request: LoteVentaRequest,
    db: Session = Depends(get_db)
):
    """
    **💰 Venta de Activo - Sistema FIFO**
    
    ### Proceso:
    1. Busca lotes disponibles del activo (más antiguos primero - FIFO)
    2. Resta cantidad de los lotes hasta completar la venta
    3. Actualiza automáticamente el estado de cada lote:
       - 🟢 → 🟡 si se vendió parcialmente
       - 🟡 → 🔴 si se agotó
    4. Suma dinero a la caja de ahorros
    5. Registra transacción(es) de venta
    
    ### Ventajas del sistema FIFO:
    - ✅ Trazabilidad completa
    - ✅ Cálculo preciso de ganancias por lote
    - ✅ Estados visuales en tiempo real
    - ✅ Cumplimiento de normativa contable
    """
    try:
        resultado = LoteService.vender_activo(
            db=db,
            id_usuario=request.id_usuario,
            id_activo=request.id_activo,
            cantidad_venta=request.cantidad,
            precio_venta=request.precio_venta,
            comision=request.comision,
            trm=request.trm,
            url_evidencia=request.url_evidencia,
            notas=request.notas
        )
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/usuario/{id_usuario}", response_model=List[LoteResponse])
async def obtener_lotes_usuario(
    id_usuario: UUID,
    solo_disponibles: bool = False,
    id_activo: UUID = None,
    db: Session = Depends(get_db)
):
    """
    **📊 Obtiene los lotes de un usuario**
    
    ### Filtros:
    - `solo_disponibles`: Solo lotes con cantidad disponible > 0
    - `id_activo`: Filtrar por activo específico
    
    ### Retorna:
    Lista de lotes con toda la información incluyendo:
    - Estado actual (Verde/Amarillo/Rojo)
    - Porcentaje disponible
    - Costo total invertido
    - Fecha de compra
    """
    try:
        lotes = LoteService.obtener_lotes_usuario(
            db=db,
            id_usuario=id_usuario,
            solo_disponibles=solo_disponibles,
            id_activo=id_activo
        )
        
        # Convertir a response con porcentaje_disponible
        return [
            {
                **lote.__dict__,
                "porcentaje_disponible": lote.porcentaje_disponible
            }
            for lote in lotes
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usuario/{id_usuario}/resumen", response_model=List[Dict])
async def obtener_resumen_por_activo(
    id_usuario: UUID,
    db: Session = Depends(get_db)
):
    """
    **📈 Resumen del portafolio agrupado por activo**
    
    ### Información por activo:
    - Cantidad total disponible
    - Inversión total
    - Precio promedio de compra
    - Número de lotes
    - Distribución de estados (🟢🟡🔴)
    """
    try:
        resumen = LoteService.obtener_resumen_por_activo(db=db, id_usuario=id_usuario)
        return resumen
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usuario/{id_usuario}/estadisticas", response_model=EstadisticasLotesResponse)
async def obtener_estadisticas(
    id_usuario: UUID,
    db: Session = Depends(get_db)
):
    """
    **📊 Estadísticas generales de lotes**
    
    Dashboard con métricas clave:
    - Total de lotes por estado
    - Porcentajes de distribución
    - Inversión total
    - Cantidad disponible total
    """
    try:
        stats = LoteService.obtener_estadisticas_lotes(db=db, id_usuario=id_usuario)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
