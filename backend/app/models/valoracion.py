"""
Modelo de Valoraciones Diarias
"""
from sqlalchemy import Column, DECIMAL, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class ValoracionDiaria(Base):
    __tablename__ = "valoraciones_diarias"
    
    id_valoracion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuarios.id_usuario', ondelete='CASCADE'), nullable=False)
    
    fecha_valoracion = Column(Date, nullable=False)
    
    # Valores agregados
    valor_mercado_total = Column(DECIMAL(18, 2), nullable=False)
    costo_total_invertido = Column(DECIMAL(18, 2), nullable=False)
    ganancia_perdida = Column(DECIMAL(18, 2))
    rentabilidad_porcentaje = Column(DECIMAL(8, 4))
    
    # Saldo en caja
    efectivo_disponible = Column(DECIMAL(18, 2))
    
    fecha_calculo = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="valoraciones")
    
    __table_args__ = (
        UniqueConstraint('id_usuario', 'fecha_valoracion', name='valoracion_unica_diaria'),
    )
    
    def __repr__(self):
        return f"<ValoracionDiaria(fecha={self.fecha_valoracion}, valor_total={self.valor_mercado_total})>"
