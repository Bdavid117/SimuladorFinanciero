"""
Motor de Cálculos Financieros
Implementa fórmulas matemáticas con precisión decimal para:
- Valoración de Bonos (Precio Sucio)
- Liquidación de CDTs con penalizaciones
- Conversión de Divisas
"""
from decimal import Decimal, getcontext
from datetime import date, datetime
from typing import Dict, Optional
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.models import Activo, ParametroSistema, CalculoBono

# Configurar precisión decimal alta para cálculos financieros
getcontext().prec = 28


class CalculoFinancieroService:
    """Servicio de cálculos financieros con precisión decimal"""
    
    @staticmethod
    def calcular_precio_bono_sucio(
        valor_nominal: Decimal,
        tasa_cupon: Decimal,
        frecuencia_cupon: int,
        tir: Decimal,
        fecha_emision: date,
        fecha_vencimiento: date,
        fecha_valoracion: date
    ) -> Dict:
        """
        Calcula el precio sucio de un bono
        
        Fórmula: Precio = Σ(Cupón/(1+TIR)^t) + Nominal/(1+TIR)^n + Cupón Acumulado
        
        Args:
            valor_nominal: Valor nominal del bono
            tasa_cupon: Tasa de cupón anual (ej: 7.25 para 7.25%)
            frecuencia_cupon: Pagos al año (1=anual, 2=semestral, 4=trimestral)
            tir: Tasa Interna de Retorno deseada (ej: 8.5 para 8.5%)
            fecha_emision: Fecha de emisión del bono
            fecha_vencimiento: Fecha de vencimiento del bono
            fecha_valoracion: Fecha a la que se valora el bono
            
        Returns:
            Dict con precio_limpio, cupon_acumulado, precio_sucio y detalles
        """
        
        # Convertir tasas de porcentaje a decimal
        tasa_cupon_decimal = tasa_cupon / Decimal('100')
        tir_decimal = tir / Decimal('100')
        
        # Cupón por periodo
        cupon_periodo = (valor_nominal * tasa_cupon_decimal) / Decimal(str(frecuencia_cupon))
        
        # Tasa por periodo
        tir_periodo = tir_decimal / Decimal(str(frecuencia_cupon))
        
        # Calcular número de periodos totales
        years_to_maturity = (fecha_vencimiento - fecha_valoracion).days / Decimal('365.25')
        num_periodos = int(years_to_maturity * frecuencia_cupon)
        
        if num_periodos <= 0:
            raise ValueError("El bono ya venció o la fecha de valoración es incorrecta")
        
        # PRECIO LIMPIO: Valor Presente de cupones + Valor Presente del nominal
        precio_limpio = Decimal('0')
        
        # 1. Valor presente de los cupones
        for t in range(1, num_periodos + 1):
            vp_cupon = cupon_periodo / ((Decimal('1') + tir_periodo) ** t)
            precio_limpio += vp_cupon
        
        # 2. Valor presente del nominal
        vp_nominal = valor_nominal / ((Decimal('1') + tir_periodo) ** num_periodos)
        precio_limpio += vp_nominal
        
        # CUPÓN ACUMULADO: Calcular días desde el último pago de cupón
        dias_desde_ultimo_cupon = CalculoFinancieroService._calcular_dias_desde_ultimo_cupon(
            fecha_emision, fecha_valoracion, frecuencia_cupon
        )
        
        # Días totales en el periodo del cupón
        dias_periodo_cupon = 365 / frecuencia_cupon
        
        # Cupón acumulado proporcional
        cupon_acumulado = cupon_periodo * (Decimal(str(dias_desde_ultimo_cupon)) / Decimal(str(dias_periodo_cupon)))
        
        # PRECIO SUCIO = Precio Limpio + Cupón Acumulado
        precio_sucio = precio_limpio + cupon_acumulado
        
        return {
            "precio_limpio": round(precio_limpio, 2),
            "cupon_acumulado": round(cupon_acumulado, 2),
            "precio_sucio": round(precio_sucio, 2),
            "cupon_periodo": round(cupon_periodo, 2),
            "num_periodos": num_periodos,
            "dias_desde_ultimo_cupon": dias_desde_ultimo_cupon,
            "tir_utilizada": tir,
            "fecha_valoracion": fecha_valoracion
        }
    
    @staticmethod
    def _calcular_dias_desde_ultimo_cupon(
        fecha_emision: date,
        fecha_actual: date,
        frecuencia_cupon: int
    ) -> int:
        """
        Calcula los días transcurridos desde el último pago de cupón
        
        Args:
            fecha_emision: Fecha de emisión del bono
            fecha_actual: Fecha actual
            frecuencia_cupon: Frecuencia de pago (1, 2, 4)
            
        Returns:
            Número de días desde el último cupón
        """
        # Meses entre pagos
        meses_entre_cupones = 12 // frecuencia_cupon
        
        # Buscar la fecha del último cupón
        fecha_ultimo_cupon = fecha_emision
        
        while fecha_ultimo_cupon < fecha_actual:
            proxima_fecha = fecha_ultimo_cupon + relativedelta(months=meses_entre_cupones)
            if proxima_fecha > fecha_actual:
                break
            fecha_ultimo_cupon = proxima_fecha
        
        # Días desde el último cupón
        dias = (fecha_actual - fecha_ultimo_cupon).days
        return dias
    
    @staticmethod
    def calcular_liquidacion_cdt(
        capital_invertido: Decimal,
        tasa_interes_anual: Decimal,
        fecha_inicio: date,
        fecha_liquidacion: date,
        plazo_dias_original: int,
        db: Session
    ) -> Dict:
        """
        Calcula la liquidación de un CDT con penalizaciones
        
        Fórmula: I = P × ((1 + i)^(n/365) - 1)
        Penalización: 10% si n ≤ 60 días, 20% si n > 60 días
        
        Args:
            capital_invertido: Capital inicial del CDT
            tasa_interes_anual: Tasa de interés anual (ej: 12.5 para 12.5%)
            fecha_inicio: Fecha de apertura del CDT
            fecha_liquidacion: Fecha de liquidación
            plazo_dias_original: Plazo original en días
            db: Sesión de base de datos para obtener parámetros
            
        Returns:
            Dict con intereses, penalización, monto a recibir y detalles
        """
        
        # Días transcurridos
        dias_transcurridos = (fecha_liquidacion - fecha_inicio).days
        
        if dias_transcurridos <= 0:
            raise ValueError("La fecha de liquidación debe ser posterior a la fecha de inicio")
        
        if dias_transcurridos > plazo_dias_original:
            dias_transcurridos = plazo_dias_original  # Límite al plazo original
        
        # Convertir tasa a decimal
        tasa_decimal = tasa_interes_anual / Decimal('100')
        
        # Calcular intereses compuestos: I = P × ((1 + i)^(n/365) - 1)
        exponente = Decimal(str(dias_transcurridos)) / Decimal('365')
        factor = (Decimal('1') + tasa_decimal) ** exponente
        interes_bruto = capital_invertido * (factor - Decimal('1'))
        
        # Determinar penalización según parámetros del sistema
        penalizacion_porcentaje = Decimal('0')
        es_liquidacion_anticipada = dias_transcurridos < plazo_dias_original
        
        if es_liquidacion_anticipada:
            # Obtener parámetros de penalización
            if dias_transcurridos <= 60:
                param = db.query(ParametroSistema).filter(
                    ParametroSistema.nombre_parametro == 'PENALIZACION_CDT_60_DIAS'
                ).first()
                penalizacion_porcentaje = param.get_valor_numeric() if param else Decimal('0.10')
            else:
                param = db.query(ParametroSistema).filter(
                    ParametroSistema.nombre_parametro == 'PENALIZACION_CDT_MAS_60_DIAS'
                ).first()
                penalizacion_porcentaje = param.get_valor_numeric() if param else Decimal('0.20')
        
        # Aplicar penalización sobre el interés
        penalizacion_monto = interes_bruto * penalizacion_porcentaje
        interes_neto = interes_bruto - penalizacion_monto
        
        # Monto total a recibir
        monto_total = capital_invertido + interes_neto
        
        # Calcular tasa efectiva real (después de penalización)
        if dias_transcurridos > 0:
            factor_efectivo = monto_total / capital_invertido
            tasa_efectiva_anual = ((factor_efectivo ** (Decimal('365') / Decimal(str(dias_transcurridos)))) - Decimal('1')) * Decimal('100')
        else:
            tasa_efectiva_anual = Decimal('0')
        
        return {
            "capital_invertido": round(capital_invertido, 2),
            "dias_transcurridos": dias_transcurridos,
            "plazo_original": plazo_dias_original,
            "es_liquidacion_anticipada": es_liquidacion_anticipada,
            "tasa_interes_anual": tasa_interes_anual,
            "interes_bruto": round(interes_bruto, 2),
            "penalizacion_porcentaje": float(penalizacion_porcentaje * 100),
            "penalizacion_monto": round(penalizacion_monto, 2),
            "interes_neto": round(interes_neto, 2),
            "monto_total_recibir": round(monto_total, 2),
            "tasa_efectiva_anual": round(tasa_efectiva_anual, 4),
            "fecha_inicio": fecha_inicio,
            "fecha_liquidacion": fecha_liquidacion
        }
    
    @staticmethod
    def convertir_divisa(
        cantidad: Decimal,
        precio_unitario: Decimal,
        trm: Decimal,
        comision: Decimal = Decimal('0')
    ) -> Dict:
        """
        Convierte el costo de un activo extranjero a moneda local
        
        Fórmula: Costo Total = (Cantidad × Precio × TRM) + Comisión
        
        Args:
            cantidad: Cantidad de activos
            precio_unitario: Precio en moneda extranjera
            trm: Tasa de cambio
            comision: Comisión de la operación
            
        Returns:
            Dict con desglose de costos
        """
        
        if cantidad <= 0 or precio_unitario <= 0 or trm <= 0:
            raise ValueError("Los valores deben ser mayores a cero")
        
        # Costo en moneda extranjera
        costo_extranjero = cantidad * precio_unitario
        
        # Conversión a moneda local
        costo_local_sin_comision = costo_extranjero * trm
        
        # Costo total con comisión
        costo_total = costo_local_sin_comision + comision
        
        # Precio unitario en moneda local
        precio_unitario_local = (precio_unitario * trm)
        
        return {
            "cantidad": cantidad,
            "precio_unitario_extranjero": round(precio_unitario, 6),
            "costo_extranjero": round(costo_extranjero, 2),
            "trm": round(trm, 6),
            "costo_local_sin_comision": round(costo_local_sin_comision, 2),
            "comision": round(comision, 2),
            "costo_total": round(costo_total, 2),
            "precio_unitario_local": round(precio_unitario_local, 6)
        }
    
    @staticmethod
    def calcular_valoracion_bono_desde_activo(
        db: Session,
        id_activo,
        tir: Decimal,
        fecha_valoracion: Optional[date] = None
    ) -> Dict:
        """
        Calcula la valoración de un bono desde su registro en la base de datos
        
        Args:
            db: Sesión de base de datos
            id_activo: UUID del activo (bono)
            tir: TIR deseada
            fecha_valoracion: Fecha de valoración (por defecto hoy)
            
        Returns:
            Dict con valoración del bono
        """
        
        activo = db.query(Activo).filter(Activo.id_activo == id_activo).first()
        
        if not activo:
            raise ValueError("Activo no encontrado")
        
        if not activo.es_bono:
            raise ValueError("El activo no es un bono")
        
        if not all([activo.valor_nominal, activo.tasa_cupon, activo.frecuencia_cupon,
                   activo.fecha_emision, activo.fecha_vencimiento]):
            raise ValueError("El bono no tiene todos los datos necesarios")
        
        if fecha_valoracion is None:
            fecha_valoracion = date.today()
        
        resultado = CalculoFinancieroService.calcular_precio_bono_sucio(
            valor_nominal=activo.valor_nominal,
            tasa_cupon=activo.tasa_cupon,
            frecuencia_cupon=activo.frecuencia_cupon,
            tir=tir,
            fecha_emision=activo.fecha_emision,
            fecha_vencimiento=activo.fecha_vencimiento,
            fecha_valoracion=fecha_valoracion
        )
        
        # Guardar el cálculo en la base de datos
        calculo = CalculoBono(
            id_activo=id_activo,
            fecha_calculo=fecha_valoracion,
            tir=tir,
            precio_limpio=resultado["precio_limpio"],
            cupon_acumulado=resultado["cupon_acumulado"],
            precio_sucio=resultado["precio_sucio"],
            dias_desde_ultimo_cupon=resultado["dias_desde_ultimo_cupon"]
        )
        
        db.add(calculo)
        db.commit()
        db.refresh(calculo)
        
        resultado["activo"] = {
            "ticker": activo.ticker,
            "nombre": activo.nombre,
            "valor_nominal": float(activo.valor_nominal)
        }
        resultado["id_calculo"] = str(calculo.id_calculo)
        
        return resultado
    
    @staticmethod
    def calcular_calificacion_final(
        rendimiento_real: Decimal,
        meta_admin: Optional[Decimal] = None,
        db: Optional[Session] = None
    ) -> Dict:
        """
        Calcula la calificación final del portafolio
        
        Fórmula: Nota = (Rendimiento Real / Meta Admin) × 5.0
        
        Args:
            rendimiento_real: Rendimiento obtenido (ej: 0.15 para 15%)
            meta_admin: Meta del administrador (si no se provee, se obtiene de BD)
            db: Sesión de base de datos
            
        Returns:
            Dict con calificación y detalles
        """
        
        if meta_admin is None:
            if db is None:
                raise ValueError("Se requiere db o meta_admin")
            
            param = db.query(ParametroSistema).filter(
                ParametroSistema.nombre_parametro == 'META_RENDIMIENTO'
            ).first()
            
            meta_admin = param.get_valor_numeric() if param else Decimal('0.15')
        
        if meta_admin == 0:
            raise ValueError("La meta del administrador no puede ser cero")
        
        # Calcular nota
        nota = (rendimiento_real / meta_admin) * Decimal('5.0')
        
        # Limitar entre 0 y 5
        nota = max(Decimal('0'), min(nota, Decimal('5.0')))
        
        # Determinar calificación cualitativa
        if nota >= Decimal('4.5'):
            calificacion = "Excelente"
        elif nota >= Decimal('4.0'):
            calificacion = "Sobresaliente"
        elif nota >= Decimal('3.5'):
            calificacion = "Bueno"
        elif nota >= Decimal('3.0'):
            calificacion = "Aceptable"
        else:
            calificacion = "Insuficiente"
        
        return {
            "rendimiento_real": float(rendimiento_real * 100),  # Convertir a porcentaje
            "meta_admin": float(meta_admin * 100),
            "nota": round(float(nota), 2),
            "calificacion": calificacion,
            "superó_meta": rendimiento_real >= meta_admin
        }
