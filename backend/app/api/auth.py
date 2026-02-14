"""
API Endpoints de Autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.caja import CajaAhorros
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    require_auth,
)
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    """Registra un nuevo usuario y retorna un token JWT."""
    existing = db.query(Usuario).filter(Usuario.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese correo electrónico",
        )

    usuario = Usuario(
        nombre=body.nombre,
        email=body.email,
        password_hash=get_password_hash(body.password),
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

    access = create_access_token(data={"sub": str(usuario.id_usuario)})
    refresh = create_refresh_token(data={"sub": str(usuario.id_usuario)})
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user_id=str(usuario.id_usuario),
        nombre=usuario.nombre,
        email=usuario.email,
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    """Inicia sesión y retorna un token JWT."""
    usuario = db.query(Usuario).filter(Usuario.email == body.email).first()
    if not usuario or not verify_password(body.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    access = create_access_token(data={"sub": str(usuario.id_usuario)})
    refresh = create_refresh_token(data={"sub": str(usuario.id_usuario)})
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user_id=str(usuario.id_usuario),
        nombre=usuario.nombre,
        email=usuario.email,
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
async def refresh_token(request: Request, body: RefreshRequest, db: Session = Depends(get_db)):
    """Renueva el access token usando un refresh token válido."""
    user_id = decode_refresh_token(body.refresh_token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado",
        )
    from uuid import UUID
    usuario = db.query(Usuario).filter(Usuario.id_usuario == UUID(user_id)).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )
    new_access = create_access_token(data={"sub": str(usuario.id_usuario)})
    new_refresh = create_refresh_token(data={"sub": str(usuario.id_usuario)})
    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
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
