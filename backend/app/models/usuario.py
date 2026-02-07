"""
Modelo de Usuario
"""
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id_usuario = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    activo = Column(Boolean, default=True)
    
    # Relaciones
    lotes = relationship("Lote", back_populates="usuario", cascade="all, delete-orphan")
    transacciones = relationship("Transaccion", back_populates="usuario", cascade="all, delete-orphan")
    caja = relationship("CajaAhorros", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    valoraciones = relationship("ValoracionDiaria", back_populates="usuario", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Usuario(nombre='{self.nombre}', email='{self.email}')>"
