"""
Configuración de pytest — tests de API con httpx
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Base de datos de prueba en memoria (SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_session():
    """Crear sesión de base de datos para tests"""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """HTTP client sincrónico usando TestClient con DB de prueba"""
    from starlette.testclient import TestClient

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_usuario(db_session):
    """Crear usuario de prueba"""
    from app.models import Usuario
    from app.auth import get_password_hash

    usuario = Usuario(
        nombre="Usuario Test",
        email="test@test.com",
        password_hash=get_password_hash("testpass123"),
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture
def sample_activo(db_session):
    """Crear activo de prueba"""
    from app.models import Activo, TipoActivo

    tipo = TipoActivo(nombre="ACCION", descripcion="Acciones")
    db_session.add(tipo)
    db_session.commit()
    db_session.refresh(tipo)

    activo = Activo(
        id_tipo_activo=tipo.id_tipo_activo,
        ticker="TEST",
        nombre="Activo de Test",
        moneda="COP",
    )
    db_session.add(activo)
    db_session.commit()
    db_session.refresh(activo)
    return activo


@pytest.fixture
def auth_headers(client):
    """Registra un usuario y devuelve headers con token JWT"""
    resp = client.post("/api/auth/register", json={
        "nombre": "Auth User",
        "email": "auth@test.com",
        "password": "secret123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
