"""
Modelo de Caja de Ahorros
"""
from sqlalchemy import Column, String, DECIMAL, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class CajaAhorros(Base):
    __tablename__ = "caja_ahorros"
    
    id_caja = Column(UUID(as_uuid=True), primary_key=True)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuarios.id_usuario', ondelete='CASCADE'), 
                       nullable=False, unique=True)
    
    saldo_actual = Column(DECIMAL(18, 2), nullable=False, default=0.00)
    moneda = Column(String(3), default='COP')
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="caja")
    
    __table_args__ = (
        CheckConstraint('saldo_actual >= 0', name='saldo_positivo'),
    )
    
    def __repr__(self):
        return f"<CajaAhorros(saldo={self.saldo_actual} {self.moneda})>"
    
    def tiene_saldo_suficiente(self, monto):
        """Verifica si hay saldo suficiente para una operación"""
        from decimal import Decimal
        return self.saldo_actual >= Decimal(str(monto))
    
    def depositar(self, monto):
        """Agrega dinero a la caja"""
        from decimal import Decimal
        self.saldo_actual += Decimal(str(monto))
        self.fecha_actualizacion = datetime.utcnow()
    
    def retirar(self, monto):
        """
        Retira dinero de la caja
        Retorna True si se pudo retirar, False si no hay suficiente saldo
        """
        from decimal import Decimal
        monto_decimal = Decimal(str(monto))
        
        if self.tiene_saldo_suficiente(monto_decimal):
            self.saldo_actual -= monto_decimal
            self.fecha_actualizacion = datetime.utcnow()
            return True
        return False
