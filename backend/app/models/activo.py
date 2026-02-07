"""
Modelos de Activos Financieros
"""
from sqlalchemy import Column, String, Boolean, Integer, DECIMAL, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base

class TipoActivo(Base):
    __tablename__ = "tipos_activos"
    
    id_tipo_activo = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String)
    requiere_trm = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
    
    # Relaciones
    activos = relationship("Activo", back_populates="tipo_activo")
    
    def __repr__(self):
        return f"<TipoActivo(nombre='{self.nombre}')>"

class Activo(Base):
    __tablename__ = "activos"
    
    id_activo = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_tipo_activo = Column(Integer, ForeignKey('tipos_activos.id_tipo_activo'))
    ticker = Column(String(20), nullable=False)
    nombre = Column(String(200), nullable=False)
    moneda = Column(String(3), default='COP')
    mercado = Column(String(50))
    es_extranjero = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
    
    # Campos específicos para BONOS
    valor_nominal = Column(DECIMAL(18, 2))
    tasa_cupon = Column(DECIMAL(8, 4))  # Porcentaje
    frecuencia_cupon = Column(Integer)  # Veces al año
    fecha_emision = Column(Date)
    fecha_vencimiento = Column(Date)
    
    # Campos específicos para CDTs
    tasa_interes_anual = Column(DECIMAL(8, 4))
    plazo_dias = Column(Integer)
    
    # Relaciones
    tipo_activo = relationship("TipoActivo", back_populates="activos")
    lotes = relationship("Lote", back_populates="activo")
    transacciones = relationship("Transaccion", back_populates="activo")
    calculos_bonos = relationship("CalculoBono", back_populates="activo")
    
    def __repr__(self):
        return f"<Activo(ticker='{self.ticker}', nombre='{self.nombre}')>"
    
    @property
    def es_bono(self):
        return self.tipo_activo.nombre == 'BONO'
    
    @property
    def es_cdt(self):
        return self.tipo_activo.nombre == 'CDT'
