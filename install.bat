@echo off
REM =====================================================================
REM Script de instalación y configuración del Simulador de Inversiones
REM Para Windows
REM =====================================================================

echo ========================================== 
echo 🎯 Simulador de Portafolio de Inversiones
echo ==========================================
echo.

REM Verificar Python
echo 📋 Verificando Python...
python --version
if errorlevel 1 (
    echo ❌ Error: Python no está instalado
    exit /b 1
)
echo ✅ Python encontrado
echo.

REM Crear entorno virtual
echo 📦 Creando entorno virtual...
python -m venv venv
echo ✅ Entorno virtual creado
echo.

REM Activar entorno virtual
echo 🔧 Activando entorno virtual...
call venv\Scripts\activate.bat
echo ✅ Entorno activado
echo.

REM Instalar dependencias
echo 📥 Instalando dependencias...
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

REM Crear archivo .env
echo ⚙️  Configurando variables de entorno...
if not exist .env (
    copy .env.example .env
    echo ✅ Archivo .env creado (recuerda configurar tus credenciales)
) else (
    echo ℹ️  Archivo .env ya existe
)
echo.

REM Mensaje final
echo ==========================================
echo ✅ Instalación completada
echo ==========================================
echo.
echo 📋 Próximos pasos:
echo.
echo 1. Configurar PostgreSQL:
echo    Abrir pgAdmin o psql
echo    CREATE DATABASE simulador_inversiones;
echo.
echo 2. Ejecutar esquema de base de datos:
echo    psql -U postgres -d simulador_inversiones -f database\schema.sql
echo.
echo 3. Configurar archivo .env con tus credenciales
echo.
echo 4. Iniciar el servidor:
echo    cd backend
echo    uvicorn app.main:app --reload
echo.
echo 5. Visitar la documentación:
echo    http://localhost:8000/docs
echo.

pause
