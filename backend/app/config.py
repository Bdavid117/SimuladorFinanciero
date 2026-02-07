"""
Configuración de la aplicación
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://usuario:password@localhost:5432/simulador_inversiones"
    
    # Seguridad
    SECRET_KEY: str = "tu_clave_secreta_super_segura_cambiar_en_produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Aplicación
    APP_NAME: str = "Simulador de Inversiones"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Parámetros financieros
    DEFAULT_TRM: float = 4800.00
    DEFAULT_COMISION_COMPRA: float = 0.01
    DEFAULT_COMISION_VENTA: float = 0.01
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
