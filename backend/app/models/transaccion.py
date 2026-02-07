"""
Modelo de Transacciones
"""
from sqlalchemy import Column, String, DECIMAL, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from enum import Enum

from app.database import Base

class TipoOperacion(str, Enum):
    COMPRA = "COMPRA"
    VENTA = "VENTA"
    DEPOSITO = "DEPOSITO"
    RETIRO = "RETIRO"
    LIQUIDACION_CDT = "LIQUIDACION_CDT"

class Transaccion(Base):
    __tablename__ = "transacciones"
    
    id_transaccion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuarios.id_usuario', ondelete='CASCADE'), nullable=False)
    id_activo = Column(UUID(as_uuid=True), ForeignKey('activos.id_activo'), nullable=True)
    
    tipo_operacion = Column(String(20), nullable=False)
    
    cantidad = Column(DECIMAL(18, 6), nullable=False)
    precio = Column(DECIMAL(18, 6))
    comision = Column(DECIMAL(18, 2), default=0.00)
    trm = Column(DECIMAL(12, 6), default=1.000000)
    
    # Montos
    monto_operacion = Column(DECIMAL(18, 2), nullable=False)
    saldo_caja_antes = Column(DECIMAL(18, 2))
    saldo_caja_despues = Column(DECIMAL(18, 2))
    
    fecha_transaccion = Column(DateTime, default=datetime.utcnow)
    
    # Referencias
    id_lote = Column(UUID(as_uuid=True), ForeignKey('lotes.id_lote'))
    
    # Evidencia
    url_evidencia = Column(String)
    notas = Column(String)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="transacciones")
    activo = relationship("Activo", back_populates="transacciones")
    lote = relationship("Lote", back_populates="transacciones")
    
    def __repr__(self):
        return f"<Transaccion(tipo='{self.tipo_operacion}', cantidad={self.cantidad}, monto={self.monto_operacion})>"
