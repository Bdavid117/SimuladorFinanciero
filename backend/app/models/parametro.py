"""
Modelo de Parámetros del Sistema
"""
from sqlalchemy import Column, String, Integer, DateTime
from datetime import datetime

from app.database import Base

class ParametroSistema(Base):
    __tablename__ = "parametros_sistema"
    
    id_parametro = Column(Integer, primary_key=True, autoincrement=True)
    nombre_parametro = Column(String(100), unique=True, nullable=False)
    valor_parametro = Column(String, nullable=False)
    tipo_dato = Column(String(20), nullable=False)  # 'NUMERIC', 'TEXT', 'BOOLEAN', 'DATE'
    descripcion = Column(String)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ParametroSistema(nombre='{self.nombre_parametro}', valor='{self.valor_parametro}')>"
    
    def get_valor_numeric(self):
        """Retorna el valor como Decimal"""
        from decimal import Decimal
        if self.tipo_dato == 'NUMERIC':
            return Decimal(self.valor_parametro)
        raise ValueError(f"El parámetro {self.nombre_parametro} no es numérico")
    
    def get_valor_bool(self):
        """Retorna el valor como booleano"""
        if self.tipo_dato == 'BOOLEAN':
            return self.valor_parametro.lower() in ('true', '1', 'yes', 'si')
        raise ValueError(f"El parámetro {self.nombre_parametro} no es booleano")
