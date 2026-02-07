"""
Modelo de Lotes (Sistema de Inventario)
"""
from sqlalchemy import Column, String, DECIMAL, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from enum import Enum

from app.database import Base

class EstadoLote(str, Enum):
    VERDE = "VERDE"       # 100% disponible
    AMARILLO = "AMARILLO" # Parcialmente vendido
    ROJO = "ROJO"         # Totalmente vendido

class Lote(Base):
    __tablename__ = "lotes"
    
    id_lote = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuarios.id_usuario', ondelete='CASCADE'), nullable=False)
    id_activo = Column(UUID(as_uuid=True), ForeignKey('activos.id_activo'), nullable=False)
    
    # Cantidades
    cantidad_inicial = Column(DECIMAL(18, 6), nullable=False)
    cantidad_disponible = Column(DECIMAL(18, 6), nullable=False)
    
    # Precios y costos
    precio_compra = Column(DECIMAL(18, 6), nullable=False)
    comision_compra = Column(DECIMAL(18, 2), default=0.00)
    trm = Column(DECIMAL(12, 6), default=1.000000)
    costo_total = Column(DECIMAL(18, 2), nullable=False)
    
    # Fechas
    fecha_compra = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Estado (se actualiza automáticamente por trigger en BD)
    estado = Column(String(10), default=EstadoLote.VERDE.value)
    
    # Evidencia
    url_evidencia = Column(String)
    notas = Column(String)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="lotes")
    activo = relationship("Activo", back_populates="lotes")
    transacciones = relationship("Transaccion", back_populates="lote")
    
    __table_args__ = (
        CheckConstraint('cantidad_disponible >= 0 AND cantidad_disponible <= cantidad_inicial', 
                       name='cantidad_disponible_valida'),
        CheckConstraint('precio_compra > 0', name='precio_positivo'),
        CheckConstraint("estado IN ('VERDE', 'AMARILLO', 'ROJO')", name='estado_valido'),
    )
    
    def __repr__(self):
        return f"<Lote(activo='{self.activo.ticker}', cantidad={self.cantidad_disponible}/{self.cantidad_inicial}, estado='{self.estado}')>"
    
    @property
    def porcentaje_disponible(self):
        """Retorna el porcentaje disponible del lote"""
        if self.cantidad_inicial == 0:
            return 0
        return float((self.cantidad_disponible / self.cantidad_inicial) * 100)
    
    @property
    def esta_disponible(self):
        """Verifica si el lote tiene cantidad disponible"""
        return self.cantidad_disponible > 0
    
    def calcular_estado(self):
        """Calcula el estado actual del lote"""
        if self.cantidad_disponible == self.cantidad_inicial:
            return EstadoLote.VERDE
        elif self.cantidad_disponible > 0:
            return EstadoLote.AMARILLO
        else:
            return EstadoLote.ROJO
    
    def restar_cantidad(self, cantidad_venta):
        """
        Resta cantidad del lote y actualiza el estado
        Retorna True si se pudo restar, False si no hay suficiente cantidad
        """
        from decimal import Decimal
        
        cantidad_venta_decimal = Decimal(str(cantidad_venta))
        
        if self.cantidad_disponible >= cantidad_venta_decimal:
            self.cantidad_disponible -= cantidad_venta_decimal
            self.estado = self.calcular_estado().value
            self.fecha_actualizacion = datetime.utcnow()
            return True
        return False
