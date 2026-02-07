"""
API Endpoints de Autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.caja import CajaAhorros
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    require_auth,
)
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Registra un nuevo usuario y retorna un token JWT."""
    existing = db.query(Usuario).filter(Usuario.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese correo electrónico",
        )

    usuario = Usuario(
        nombre=request.nombre,
        email=request.email,
        password_hash=get_password_hash(request.password),
    )
    db.add(usuario)
    db.flush()

    # Crear caja de ahorros con saldo inicial
    caja = CajaAhorros(
        id_caja=usuario.id_usuario,
        id_usuario=usuario.id_usuario,
        saldo_actual=100_000_000,  # $100M COP de saldo demo
    )
    db.add(caja)
    db.commit()
    db.refresh(usuario)

    token = create_access_token(data={"sub": str(usuario.id_usuario)})
    return TokenResponse(
        access_token=token,
        user_id=str(usuario.id_usuario),
        nombre=usuario.nombre,
        email=usuario.email,
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Inicia sesión y retorna un token JWT."""
    usuario = db.query(Usuario).filter(Usuario.email == request.email).first()
    if not usuario or not verify_password(request.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    token = create_access_token(data={"sub": str(usuario.id_usuario)})
    return TokenResponse(
        access_token=token,
        user_id=str(usuario.id_usuario),
        nombre=usuario.nombre,
        email=usuario.email,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Usuario = Depends(require_auth)):
    """Obtiene la información del usuario autenticado."""
    return UserResponse(
        id_usuario=str(current_user.id_usuario),
        nombre=current_user.nombre,
        email=current_user.email,
        activo=current_user.activo,
    )
