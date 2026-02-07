"""
Tests reales de API — Autenticación, Cálculos Financieros
"""
import pytest
from datetime import date, timedelta


# ═══════════════════════════════════════════════
# Auth endpoints
# ═══════════════════════════════════════════════
class TestAuth:
    """Tests para /api/auth/*"""

    def test_register_exitoso(self, client):
        resp = client.post("/api/auth/register", json={
            "nombre": "Nuevo User",
            "email": "nuevo@test.com",
            "password": "clave123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_register_email_duplicado(self, client):
        payload = {"nombre": "A", "email": "dup@test.com", "password": "123456"}
        client.post("/api/auth/register", json=payload)
        resp = client.post("/api/auth/register", json=payload)
        assert resp.status_code == 400
        assert "ya registrado" in resp.json()["detail"].lower() or "registrado" in resp.json()["detail"].lower()

    def test_login_exitoso(self, client):
        client.post("/api/auth/register", json={
            "nombre": "Login",
            "email": "login@test.com",
            "password": "mypass",
        })
        resp = client.post("/api/auth/login", json={
            "email": "login@test.com",
            "password": "mypass",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_password_incorrecto(self, client):
        client.post("/api/auth/register", json={
            "nombre": "Usr",
            "email": "bad@test.com",
            "password": "correct",
        })
        resp = client.post("/api/auth/login", json={
            "email": "bad@test.com",
            "password": "incorrect",
        })
        assert resp.status_code == 401

    def test_me_sin_token(self, client):
        resp = client.get("/api/auth/me")
        # Debería ser 401 o 403 según tu implementación
        assert resp.status_code in (401, 403)

    def test_me_con_token(self, client, auth_headers):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "auth@test.com"


# ═══════════════════════════════════════════════
# Cálculos Financieros
# ═══════════════════════════════════════════════
class TestCalculosBono:
    """Tests para /api/calculos/bono/precio-sucio"""

    def test_calculo_bono_basico(self, client):
        resp = client.post("/api/calculos/bono/precio-sucio", json={
            "valor_nominal": 1_000_000,
            "tasa_cupon": 0.08,
            "frecuencia_cupon": 2,
            "tir": 0.10,
            "fecha_emision": "2024-01-01",
            "fecha_vencimiento": "2029-01-01",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["precio_sucio"] > 0
        assert data["precio_limpio"] > 0
        assert data["num_periodos"] > 0


class TestCalculosCDT:
    """Tests para /api/calculos/cdt/liquidar"""

    def test_cdt_liquidacion_anticipada(self, client):
        hoy = date.today()
        inicio = (hoy - timedelta(days=45)).isoformat()
        resp = client.post("/api/calculos/cdt/liquidar", json={
            "capital_invertido": 10_000_000,
            "tasa_interes_anual": 0.12,
            "fecha_inicio": inicio,
            "fecha_liquidacion": hoy.isoformat(),
            "plazo_dias_original": 360,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["es_liquidacion_anticipada"] is True
        assert data["penalizacion_monto"] > 0
        assert data["monto_total_recibir"] > 0

    def test_cdt_al_vencimiento(self, client):
        hoy = date.today()
        inicio = (hoy - timedelta(days=360)).isoformat()
        resp = client.post("/api/calculos/cdt/liquidar", json={
            "capital_invertido": 10_000_000,
            "tasa_interes_anual": 0.10,
            "fecha_inicio": inicio,
            "fecha_liquidacion": hoy.isoformat(),
            "plazo_dias_original": 360,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["es_liquidacion_anticipada"] is False
        assert data["penalizacion_monto"] == 0


class TestCalculosDivisa:
    """Tests para /api/calculos/divisa/convertir"""

    def test_conversion_basica(self, client):
        resp = client.post("/api/calculos/divisa/convertir", json={
            "cantidad": 100,
            "precio_unitario": 150.25,
            "trm": 4800,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["costo_total"] > 0
        # costo = 100 * 150.25 * 4800 = 72,120,000
        assert data["costo_local_sin_comision"] == pytest.approx(72_120_000, rel=0.01)

    def test_conversion_con_comision(self, client):
        resp = client.post("/api/calculos/divisa/convertir", json={
            "cantidad": 10,
            "precio_unitario": 100,
            "trm": 4000,
            "comision": 50_000,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["comision"] == pytest.approx(50_000, rel=0.01)
        assert data["costo_total"] > data["costo_local_sin_comision"]


class TestCalificacion:
    """Tests para /api/calculos/calificacion"""

    def test_calificacion_alta(self, client):
        resp = client.post("/api/calculos/calificacion", json={
            "rendimiento_real": 0.20,
            "meta_admin": 0.08,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["nota"] > 4
        assert "calificacion" in data

    def test_calificacion_baja(self, client):
        resp = client.post("/api/calculos/calificacion", json={
            "rendimiento_real": 0.02,
            "meta_admin": 0.15,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["nota"] < 3


# ═══════════════════════════════════════════════
# Health & Root
# ═══════════════════════════════════════════════
class TestHealth:
    def test_root(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "mensaje" in resp.json()

    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"
