"""
API Endpoints para Cálculos Financieros
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from app.database import get_db
from app.services.calculo_service import CalculoFinancieroService
from app.schemas.calculo_schemas import (
    CalculoBonoRequest, CalculoBonoResponse,
    CalculoBonoActivoRequest,
    CalculoCDTRequest, CalculoCDTResponse,
    ConversionDivisaRequest, ConversionDivisaResponse,
    CalificacionRequest, CalificacionResponse
)

router = APIRouter()

@router.post("/bono/precio-sucio", response_model=CalculoBonoResponse)
async def calcular_precio_bono(
    request: CalculoBonoRequest,
    db: Session = Depends(get_db)
):
    """
    **Calcula el Precio Sucio de un Bono**
    
    Fórmula implementada:
    
    $$Precio = \\sum_{t=1}^{n} \\frac{Cupón}{(1+TIR)^t} + \\frac{Nominal}{(1+TIR)^n} + Cupón \\ Acumulado$$
    
    ### Componentes:
    - **Precio Limpio**: Valor presente de cupones + valor presente del nominal
    - **Cupón Acumulado**: Interés devengado desde el último pago de cupón
    - **Precio Sucio**: Precio limpio + cupón acumulado (precio de mercado)
    
    ### Casos de uso:
    - Valoración de bonos gubernamentales (TES)
    - Bonos corporativos
    - Cálculo de TIR implícita
    """
    try:
        resultado = CalculoFinancieroService.calcular_precio_bono_sucio(
            valor_nominal=request.valor_nominal,
            tasa_cupon=request.tasa_cupon,
            frecuencia_cupon=request.frecuencia_cupon,
            tir=request.tir,
            fecha_emision=request.fecha_emision,
            fecha_vencimiento=request.fecha_vencimiento,
            fecha_valoracion=request.fecha_valoracion or __import__('datetime').date.today()
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bono/desde-activo", response_model=Dict)
async def calcular_bono_desde_activo(
    request: CalculoBonoActivoRequest,
    db: Session = Depends(get_db)
):
    """
    **Calcula valoración de un bono registrado en la base de datos**
    
    Obtiene los parámetros del bono desde la tabla de activos y calcula
    su valoración actual. Guarda el resultado en el historial de cálculos.
    """
    try:
        resultado = CalculoFinancieroService.calcular_valoracion_bono_desde_activo(
            db=db,
            id_activo=request.id_activo,
            tir=request.tir,
            fecha_valoracion=request.fecha_valoracion
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cdt/liquidar", response_model=CalculoCDTResponse)
async def calcular_liquidacion_cdt(
    request: CalculoCDTRequest,
    db: Session = Depends(get_db)
):
    """
    **Calcula la liquidación de un CDT con penalizaciones**
    
    Fórmula de interés compuesto:
    
    $$I = P \\times \\left((1 + i)^{\\frac{n}{365}} - 1\\right)$$
    
    ### Penalizaciones (configurables):
    - **10%** sobre el interés si liquidación ≤ 60 días
    - **20%** sobre el interés si liquidación > 60 días
    
    ### Retorna:
    - Interés bruto calculado
    - Penalización aplicada
    - Interés neto (después de penalización)
    - Monto total a recibir
    - Tasa efectiva anual real
    """
    try:
        resultado = CalculoFinancieroService.calcular_liquidacion_cdt(
            capital_invertido=request.capital_invertido,
            tasa_interes_anual=request.tasa_interes_anual,
            fecha_inicio=request.fecha_inicio,
            fecha_liquidacion=request.fecha_liquidacion,
            plazo_dias_original=request.plazo_dias_original,
            db=db
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/divisa/convertir", response_model=ConversionDivisaResponse)
async def convertir_divisa(request: ConversionDivisaRequest):
    """
    **Convierte el costo de activos extranjeros a moneda local**
    
    Fórmula:
    
    $$Costo \\ Total = (Cantidad \\times Precio \\times TRM) + Comisión$$
    
    ### Ejemplo:
    - Comprar 100 acciones de Apple a USD 150.25
    - TRM: COP/USD = 4800
    - Comisión: COP 50,000
    - **Resultado**: COP 72,170,000
    """
    try:
        resultado = CalculoFinancieroService.convertir_divisa(
            cantidad=request.cantidad,
            precio_unitario=request.precio_unitario,
            trm=request.trm,
            comision=request.comision
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/calificacion", response_model=CalificacionResponse)
async def calcular_calificacion(
    request: CalificacionRequest,
    db: Session = Depends(get_db)
):
    """
    **Calcula la calificación final del portafolio**
    
    Fórmula:
    
    $$Nota = \\frac{Rendimiento \\ Real}{Meta \\ Admin} \\times 5.0$$
    
    ### Escala de calificación:
    - **4.5 - 5.0**: Excelente
    - **4.0 - 4.4**: Sobresaliente
    - **3.5 - 3.9**: Bueno
    - **3.0 - 3.4**: Aceptable
    - **< 3.0**: Insuficiente
    
    ### Ejemplo:
    - Rendimiento real: 18% (0.18)
    - Meta admin: 15% (0.15)
    - **Nota**: (0.18 / 0.15) × 5.0 = 6.0 → **5.0** (máximo)
    - **Calificación**: Excelente ✅
    """
    try:
        resultado = CalculoFinancieroService.calcular_calificacion_final(
            rendimiento_real=request.rendimiento_real,
            meta_admin=request.meta_admin,
            db=db
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
