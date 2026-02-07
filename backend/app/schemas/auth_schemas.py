"""
Schemas Pydantic para Autenticación
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Brayan Collazos",
                "email": "brayan@simulador.com",
                "password": "miPassword123",
            }
        }


class LoginRequest(BaseModel):
    email: str = Field(...)
    password: str = Field(...)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    nombre: str
    email: str


class UserResponse(BaseModel):
    id_usuario: str
    nombre: str
    email: str
    activo: bool

    class Config:
        from_attributes = True
