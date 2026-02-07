"""
Servicio de Gestión de Lotes - Sistema de Inventario
Implementa la lógica de compra/venta con sistema de semáforo (Verde/Amarillo/Rojo)
"""
from decimal import Decimal
from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import Lote, Transaccion, CajaAhorros, Activo, EstadoLote, TipoOperacion
import uuid


class LoteService:
    """Servicio para gestión de lotes de activos"""
    
    @staticmethod
    def comprar_activo(
        db: Session,
        id_usuario: uuid.UUID,
        id_activo: uuid.UUID,
        cantidad: Decimal,
        precio_compra: Decimal,
        comision: Decimal = Decimal('0'),
        trm: Decimal = Decimal('1'),
        url_evidencia: Optional[str] = None,
        notas: Optional[str] = None
    ) -> Dict:
        """
        Crea un nuevo lote al realizar una compra de activo
        
        Args:
            db: Sesión de base de datos
            id_usuario: UUID del usuario
            id_activo: UUID del activo a comprar
            cantidad: Cantidad de activos a comprar
            precio_compra: Precio unitario de compra
            comision: Comisión de la operación
            trm: Tasa de cambio (para activos extranjeros)
            url_evidencia: URL de screenshot del precio
            notas: Notas adicionales
            
        Returns:
            Dict con el lote creado y la transacción
            
        Raises:
            ValueError: Si no hay saldo suficiente o parámetros inválidos
        """
        
        # Validaciones
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        if precio_compra <= 0:
            raise ValueError("El precio debe ser mayor a cero")
        
        # Obtener caja de ahorros
        caja = db.query(CajaAhorros).filter(
            CajaAhorros.id_usuario == id_usuario
        ).first()
        
        if not caja:
            raise ValueError("No se encontró la caja de ahorros del usuario")
        
        # Calcular costo total: (cantidad * precio * TRM) + comisión
        costo_total = (cantidad * precio_compra * trm) + comision
        
        # Validar saldo suficiente
        if not caja.tiene_saldo_suficiente(costo_total):
            raise ValueError(
                f"Saldo insuficiente. Disponible: {caja.saldo_actual}, "
                f"Requerido: {costo_total}"
            )
        
        # Guardar saldo anterior
        saldo_anterior = caja.saldo_actual
        
        # Retirar dinero de la caja
        if not caja.retirar(costo_total):
            raise ValueError("Error al retirar el dinero de la caja")
        
        # Crear el lote
        nuevo_lote = Lote(
            id_usuario=id_usuario,
            id_activo=id_activo,
            cantidad_inicial=cantidad,
            cantidad_disponible=cantidad,
            precio_compra=precio_compra,
            comision_compra=comision,
            trm=trm,
            costo_total=costo_total,
            fecha_compra=datetime.utcnow(),
            estado=EstadoLote.VERDE.value,
            url_evidencia=url_evidencia,
            notas=notas
        )
        
        db.add(nuevo_lote)
        db.flush()  # Para obtener el ID del lote
        
        # Registrar transacción
        transaccion = Transaccion(
            id_usuario=id_usuario,
            id_activo=id_activo,
            tipo_operacion=TipoOperacion.COMPRA.value,
            cantidad=cantidad,
            precio=precio_compra,
            comision=comision,
            trm=trm,
            monto_operacion=costo_total,
            saldo_caja_antes=saldo_anterior,
            saldo_caja_despues=caja.saldo_actual,
            id_lote=nuevo_lote.id_lote,
            url_evidencia=url_evidencia,
            notas=notas
        )
        
        db.add(transaccion)
        db.commit()
        db.refresh(nuevo_lote)
        db.refresh(transaccion)
        
        return {
            "lote": nuevo_lote,
            "transaccion": transaccion,
            "mensaje": f"Compra exitosa. Lote {nuevo_lote.id_lote} creado en estado VERDE"
        }
    
    @staticmethod
    def vender_activo(
        db: Session,
        id_usuario: uuid.UUID,
        id_activo: uuid.UUID,
        cantidad_venta: Decimal,
        precio_venta: Decimal,
        comision: Decimal = Decimal('0'),
        trm: Decimal = Decimal('1'),
        url_evidencia: Optional[str] = None,
        notas: Optional[str] = None
    ) -> Dict:
        """
        Vende activos desde los lotes disponibles (FIFO)
        Actualiza automáticamente el estado de los lotes (semáforo)
        
        Args:
            db: Sesión de base de datos
            id_usuario: UUID del usuario
            id_activo: UUID del activo a vender
            cantidad_venta: Cantidad a vender
            precio_venta: Precio unitario de venta
            comision: Comisión de la operación
            trm: Tasa de cambio
            url_evidencia: URL de evidencia
            notas: Notas adicionales
            
        Returns:
            Dict con detalles de la venta y lotes afectados
            
        Raises:
            ValueError: Si no hay suficiente cantidad disponible
        """
        
        # Validaciones
        if cantidad_venta <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        if precio_venta <= 0:
            raise ValueError("El precio debe ser mayor a cero")
        
        # Obtener lotes disponibles (FIFO - más antiguos primero)
        lotes_disponibles = db.query(Lote).filter(
            and_(
                Lote.id_usuario == id_usuario,
                Lote.id_activo == id_activo,
                Lote.cantidad_disponible > 0
            )
        ).order_by(Lote.fecha_compra.asc()).all()
        
        if not lotes_disponibles:
            raise ValueError("No hay lotes disponibles para este activo")
        
        # Verificar cantidad total disponible
        cantidad_total_disponible = sum(
            lote.cantidad_disponible for lote in lotes_disponibles
        )
        
        if cantidad_total_disponible < cantidad_venta:
            raise ValueError(
                f"Cantidad insuficiente. Disponible: {cantidad_total_disponible}, "
                f"Solicitado: {cantidad_venta}"
            )
        
        # Obtener caja de ahorros
        caja = db.query(CajaAhorros).filter(
            CajaAhorros.id_usuario == id_usuario
        ).first()
        
        if not caja:
            raise ValueError("No se encontró la caja de ahorros del usuario")
        
        # Calcular monto de venta: (cantidad * precio * TRM) - comisión
        monto_venta = (cantidad_venta * precio_venta * trm) - comision
        saldo_anterior = caja.saldo_actual
        
        # Procesar venta por lotes (FIFO)
        cantidad_restante = cantidad_venta
        lotes_afectados = []
        transacciones_creadas = []
        
        for lote in lotes_disponibles:
            if cantidad_restante <= 0:
                break
            
            # Cantidad a tomar de este lote
            cantidad_de_este_lote = min(cantidad_restante, lote.cantidad_disponible)
            
            # Restar cantidad del lote (actualiza estado automáticamente)
            if lote.restar_cantidad(cantidad_de_este_lote):
                lotes_afectados.append({
                    "id_lote": lote.id_lote,
                    "cantidad_vendida": cantidad_de_este_lote,
                    "estado_anterior": lote.estado,
                    "estado_nuevo": lote.calcular_estado().value,
                    "cantidad_restante": lote.cantidad_disponible
                })
                
                # Calcular proporción del monto para este lote
                proporcion = cantidad_de_este_lote / cantidad_venta
                monto_este_lote = monto_venta * proporcion
                comision_lote = comision * proporcion
                
                # Registrar transacción para este lote
                transaccion = Transaccion(
                    id_usuario=id_usuario,
                    id_activo=id_activo,
                    tipo_operacion=TipoOperacion.VENTA.value,
                    cantidad=cantidad_de_este_lote,
                    precio=precio_venta,
                    comision=comision_lote,
                    trm=trm,
                    monto_operacion=monto_este_lote,
                    saldo_caja_antes=caja.saldo_actual,
                    saldo_caja_despues=caja.saldo_actual + monto_este_lote,
                    id_lote=lote.id_lote,
                    url_evidencia=url_evidencia,
                    notas=f"Venta FIFO - Lote {lote.id_lote}"
                )
                
                db.add(transaccion)
                transacciones_creadas.append(transaccion)
                
                cantidad_restante -= cantidad_de_este_lote
            else:
                raise ValueError(f"Error al procesar el lote {lote.id_lote}")
        
        # Agregar dinero a la caja
        caja.depositar(monto_venta)
        
        db.commit()
        
        # Refrescar objetos
        for lote in lotes_disponibles:
            db.refresh(lote)
        db.refresh(caja)
        
        return {
            "cantidad_vendida": cantidad_venta,
            "precio_venta": precio_venta,
            "monto_total": monto_venta,
            "comision": comision,
            "lotes_afectados": lotes_afectados,
            "transacciones": len(transacciones_creadas),
            "saldo_anterior": saldo_anterior,
            "saldo_nuevo": caja.saldo_actual,
            "mensaje": f"Venta exitosa de {cantidad_venta} unidades"
        }
    
    @staticmethod
    def obtener_lotes_usuario(
        db: Session,
        id_usuario: uuid.UUID,
        solo_disponibles: bool = False,
        id_activo: Optional[uuid.UUID] = None
    ) -> List[Lote]:
        """
        Obtiene los lotes de un usuario
        
        Args:
            db: Sesión de base de datos
            id_usuario: UUID del usuario
            solo_disponibles: Si True, solo retorna lotes con cantidad disponible
            id_activo: Filtrar por activo específico
            
        Returns:
            Lista de lotes
        """
        query = db.query(Lote).filter(Lote.id_usuario == id_usuario)
        
        if solo_disponibles:
            query = query.filter(Lote.cantidad_disponible > 0)
        
        if id_activo:
            query = query.filter(Lote.id_activo == id_activo)
        
        return query.order_by(Lote.fecha_compra.desc()).all()
    
    @staticmethod
    def obtener_resumen_por_activo(
        db: Session,
        id_usuario: uuid.UUID
    ) -> List[Dict]:
        """
        Obtiene un resumen agrupado por activo
        
        Args:
            db: Sesión de base de datos
            id_usuario: UUID del usuario
            
        Returns:
            Lista de diccionarios con resumen por activo
        """
        lotes = db.query(Lote).filter(
            and_(
                Lote.id_usuario == id_usuario,
                Lote.cantidad_disponible > 0
            )
        ).all()
        
        # Agrupar por activo
        resumen = {}
        for lote in lotes:
            activo_id = str(lote.id_activo)
            
            if activo_id not in resumen:
                resumen[activo_id] = {
                    "activo": lote.activo,
                    "cantidad_total": Decimal('0'),
                    "inversion_total": Decimal('0'),
                    "precio_promedio": Decimal('0'),
                    "lotes_verdes": 0,
                    "lotes_amarillos": 0,
                    "lotes_rojos": 0,
                    "numero_lotes": 0
                }
            
            resumen[activo_id]["cantidad_total"] += lote.cantidad_disponible
            resumen[activo_id]["inversion_total"] += lote.costo_total
            resumen[activo_id]["numero_lotes"] += 1
            
            # Contar estados
            if lote.estado == EstadoLote.VERDE.value:
                resumen[activo_id]["lotes_verdes"] += 1
            elif lote.estado == EstadoLote.AMARILLO.value:
                resumen[activo_id]["lotes_amarillos"] += 1
            elif lote.estado == EstadoLote.ROJO.value:
                resumen[activo_id]["lotes_rojos"] += 1
        
        # Calcular precio promedio
        for activo_id in resumen:
            if resumen[activo_id]["cantidad_total"] > 0:
                resumen[activo_id]["precio_promedio"] = (
                    resumen[activo_id]["inversion_total"] / 
                    resumen[activo_id]["cantidad_total"]
                )
        
        return list(resumen.values())
    
    @staticmethod
    def obtener_estadisticas_lotes(
        db: Session,
        id_usuario: uuid.UUID
    ) -> Dict:
        """
        Obtiene estadísticas generales de los lotes del usuario
        
        Args:
            db: Sesión de base de datos
            id_usuario: UUID del usuario
            
        Returns:
            Diccionario con estadísticas
        """
        lotes = db.query(Lote).filter(Lote.id_usuario == id_usuario).all()
        
        total_lotes = len(lotes)
        lotes_verdes = sum(1 for l in lotes if l.estado == EstadoLote.VERDE.value)
        lotes_amarillos = sum(1 for l in lotes if l.estado == EstadoLote.AMARILLO.value)
        lotes_rojos = sum(1 for l in lotes if l.estado == EstadoLote.ROJO.value)
        
        inversion_total = sum(l.costo_total for l in lotes)
        cantidad_disponible_total = sum(l.cantidad_disponible for l in lotes)
        
        return {
            "total_lotes": total_lotes,
            "lotes_verdes": lotes_verdes,
            "lotes_amarillos": lotes_amarillos,
            "lotes_rojos": lotes_rojos,
            "porcentaje_verde": (lotes_verdes / total_lotes * 100) if total_lotes > 0 else 0,
            "porcentaje_amarillo": (lotes_amarillos / total_lotes * 100) if total_lotes > 0 else 0,
            "porcentaje_rojo": (lotes_rojos / total_lotes * 100) if total_lotes > 0 else 0,
            "inversion_total": inversion_total,
            "cantidad_disponible_total": cantidad_disponible_total
        }
