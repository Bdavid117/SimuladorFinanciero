# ============================================================
# Script de inicio - Simulador Financiero
# Ejecuta backend (FastAPI) y frontend (Vite) simultaneamente
# ============================================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   Simulador de Portafolio de Inversiones      ║" -ForegroundColor Cyan
Write-Host "  ╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# --- Backend ---
Write-Host "  [1/2] Iniciando Backend (FastAPI)..." -ForegroundColor Yellow
$env:PYTHONPATH = "$ROOT\backend"

$backend = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$env:PYTHONPATH='$ROOT\backend'; Set-Location '$ROOT'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
) -PassThru

Start-Sleep -Seconds 2

# --- Frontend ---
Write-Host "  [2/2] Iniciando Frontend (Vite)..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ROOT\frontend'; npm run dev"
) -PassThru

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  ✓ Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "  ✓ Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  ✓ API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "  Presiona Ctrl+C en cada ventana para detener los servidores." -ForegroundColor DarkGray
Write-Host ""
