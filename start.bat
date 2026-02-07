@echo off
REM ============================================================
REM Script de inicio - Simulador Financiero
REM Ejecuta backend (FastAPI) y frontend (Vite) simultaneamente
REM ============================================================

set ROOT=%~dp0
echo.
echo   ======================================================
echo     Simulador de Portafolio de Inversiones
echo   ======================================================
echo.

echo   [1/2] Iniciando Backend (FastAPI)...
set PYTHONPATH=%ROOT%backend
start "Backend - FastAPI" cmd /k "cd /d %ROOT% && set PYTHONPATH=%ROOT%backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo   [2/2] Iniciando Frontend (Vite)...
start "Frontend - Vite" cmd /k "cd /d %ROOT%frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo.
echo   Cierra las ventanas de comandos para detener los servidores.
echo.
pause
