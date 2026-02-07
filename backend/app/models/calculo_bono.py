"""
Modelo de Cálculos de Bonos
"""
from sqlalchemy import Column, Integer, DECIMAL, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class CalculoBono(Base):
    __tablename__ = "calculos_bonos"
    
    id_calculo = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_activo = Column(UUID(as_uuid=True), ForeignKey('activos.id_activo'), nullable=False)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuarios.id_usuario'))
    
    fecha_calculo = Column(Date, nullable=False)
    tir = Column(DECIMAL(8, 6), nullable=False)  # Tasa Interna de Retorno
    
    precio_limpio = Column(DECIMAL(18, 2))
    cupon_acumulado = Column(DECIMAL(18, 2))
    precio_sucio = Column(DECIMAL(18, 2))
    
    dias_desde_ultimo_cupon = Column(Integer)
    
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    activo = relationship("Activo", back_populates="calculos_bonos")
    
    def __repr__(self):
        return f"<CalculoBono(activo_id={self.id_activo}, precio_sucio={self.precio_sucio})>"
