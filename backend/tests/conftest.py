"""
Configuración de pytest
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base

# Base de datos de prueba en memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    """Crear sesión de base de datos para tests"""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def sample_usuario(db_session):
    """Crear usuario de prueba"""
    from app.models import Usuario
    usuario = Usuario(
        nombre="Usuario Test",
        email="test@test.com",
        password_hash="hashed_password"
    )
    db_session.add(usuario)
    db_session.commit()
    return usuario

@pytest.fixture
def sample_activo(db_session):
    """Crear activo de prueba"""
    from app.models import Activo, TipoActivo
    
    tipo = TipoActivo(nombre="ACCION", descripcion="Acciones")
    db_session.add(tipo)
    db_session.commit()
    
    activo = Activo(
        id_tipo_activo=tipo.id_tipo_activo,
        ticker="TEST",
        nombre="Activo de Test",
        moneda="COP"
    )
    db_session.add(activo)
    db_session.commit()
    return activo
