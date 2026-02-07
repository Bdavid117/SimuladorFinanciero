"""
Aplicación Principal FastAPI - Simulador de Inversiones
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Importar routers
from app.api import lotes, calculos, auth

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Simulador de Portafolio de Inversiones
    
    Sistema de gestión de portafolios con:
    - Sistema de lotes con semáforo (Verde/Amarillo/Rojo)
    - Motor de cálculos financieros (Bonos, CDTs, Divisas)
    - Sistema de caja de ahorros
    - Calificación automática de rendimiento
    
    ### Características principales:
    
    #### Gestión de Lotes
    - Compra de activos con creación de lotes
    - Venta FIFO con actualización automática de estados
    - Trazabilidad completa de transacciones
    
    #### Cálculos Financieros
    - **Bonos**: Precio sucio con cupón acumulado
    - **CDTs**: Liquidación con penalizaciones
    - **Divisas**: Conversión automática con TRM
    
    #### Sistema de Calificación
    - Nota = (Rendimiento Real / Meta Admin) × 5.0
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
# Parse ALLOWED_ORIGINS from comma-separated string or list
origins = settings.ALLOWED_ORIGINS
if isinstance(origins, str):
    origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz de bienvenida"""
    return {
        "mensaje": "Bienvenido al Simulador de Portafolio de Inversiones",
        "version": settings.APP_VERSION,
        "documentacion": "/docs",
        "estado": "activo"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Endpoint de health check"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(lotes.router, prefix="/api/lotes", tags=["Lotes - Sistema de Inventario"])
app.include_router(calculos.router, prefix="/api/calculos", tags=["Cálculos Financieros"])
