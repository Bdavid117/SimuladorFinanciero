# Estructura del Proyecto - Simulador Financiero

## Resumen Ejecutivo
Simulador de Portafolio de Inversiones Web completo con sistema de lotes, cálculos financieros avanzados y gestión de caja de ahorros.

---

## Árbol de Directorios

```
SimuladorFinanciero/
│
├── README.md                     # Documentación principal del proyecto
├── RESUMEN_ENTREGABLES.md       # Resumen ejecutivo de entregables
├── VALIDACION_FORMULAS.md       # Validación matemática de fórmulas
├── INSTALACION.md               # Guía de instalación detallada
├── requirements.txt             # Dependencias Python
├── .env.example                 # Plantilla de variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── install.bat                  # Script instalación Windows
├── install.sh                   # Script instalación Linux/Mac
│
├── database/                    # Scripts SQL
│   └── schema.sql               # Esquema completo PostgreSQL
│                                    # (11 tablas, 2 triggers, 2 views)
│
├── backend/                     # Backend FastAPI
│   │
│   ├── ejemplos_uso.py          # Ejemplos de uso del sistema
│   │
│   ├── app/                     # Aplicación principal
│   │   ├── __init__.py
│   │   ├── main.py              # Entry point FastAPI
│   │   ├── config.py            # Configuración (settings)
│   │   ├── database.py          # Conexión PostgreSQL
│   │   │
│   │   ├── models/              # Modelos SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── usuario.py       # Modelo Usuario
│   │   │   ├── caja.py          # Modelo CajaAhorros
│   │   │   ├── activo.py        # Modelos Activo y TipoActivo
│   │   │   ├── lote.py          # Modelo Lote (con estados)
│   │   │   ├── transaccion.py   # Modelo Transaccion
│   │   │   ├── parametro.py     # Modelo ParametroSistema
│   │   │   ├── calculo_bono.py  # Modelo CalculoBono
│   │   │   ├── valoracion.py    # Modelo ValoracionDiaria
│   │   │
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── __init__.py
│   │   │   ├── lote_service.py        # Servicio de Lotes
│   │   │   │                              # - comprar_activo()
│   │   │   │                              # - vender_activo() con FIFO
│   │   │   │                              # - obtener_resumen_por_activo()
│   │   │   │                              # - obtener_estadisticas_lotes()
│   │   │   │
│   │   │   └── calculo_service.py     # Servicio de Cálculos
│   │   │                                  # - calcular_precio_bono_sucio()
│   │   │                                  # - calcular_liquidacion_cdt()
│   │   │                                  # - convertir_divisa()
│   │   │                                  # - calcular_calificacion_final()
│   │   │
│   │   ├── schemas/             # Esquemas Pydantic
│   │   │   ├── __init__.py
│   │   │   ├── lote_schemas.py        # Schemas de Lotes
│   │   │   │                              # - LoteCompraRequest
│   │   │   │                              # - LoteVentaRequest
│   │   │   │                              # - LoteResponse
│   │   │   │                              # - EstadisticasLotesResponse
│   │   │   │
│   │   │   └── calculo_schemas.py     # Schemas de Cálculos
│   │   │                                  # - CalculoBonoRequest/Response
│   │   │                                  # - CalculoCDTRequest/Response
│   │   │                                  # - ConversionDivisaRequest/Response
│   │   │                                  # - CalificacionRequest/Response
│   │   │
│   │   └── api/                 # Endpoints REST
│   │       ├── __init__.py
│   │       ├── lotes.py               # Endpoints de Lotes
│   │       │                              # POST /api/lotes/comprar
│   │       │                              # POST /api/lotes/vender
│   │       │                              # GET  /api/lotes/usuario/{id}
│   │       │                              # GET  /api/lotes/usuario/{id}/resumen
│   │       │                              # GET  /api/lotes/usuario/{id}/estadisticas
│   │       │
│   │       └── calculos.py            # Endpoints de Cálculos
│   │                                      # POST /api/calculos/bono/precio-sucio
│   │                                      # POST /api/calculos/bono/desde-activo
│   │                                      # POST /api/calculos/cdt/liquidar
│   │                                      # POST /api/calculos/divisa/convertir
│   │                                      # POST /api/calculos/calificacion
│   │
│   └── tests/                   # Tests unitarios
│       ├── __init__.py
│       ├── conftest.py          # Configuración pytest
│       └── test_services.py     # Tests de servicios
│
└── venv/                        # Entorno virtual Python
```

---

## Archivos Clave

### Base de Datos
- **`database/schema.sql`**: Esquema completo con:
  - 11 tablas principales
  - 2 triggers automáticos (estado_lote, validar_saldo_caja)
  - 2 vistas (v_resumen_portafolio, v_lotes_disponibles)
  - Índices optimizados
  - Constraints de integridad referencial

### Backend API
- **`backend/app/main.py`**: Aplicación FastAPI con:
  - Configuración CORS
  - Documentación automática en `/docs`
  - Inclusión de routers (lotes, calculos)

### Lógica de Negocio
- **`backend/app/services/lote_service.py`**: 
  - Gestión completa de lotes
  - Sistema de semáforo (VERDE/AMARILLO/ROJO)
  - Lógica FIFO para ventas
  - Validación de saldo en caja

- **`backend/app/services/calculo_service.py`**:
  - Valoración de bonos (precio sucio)
  - Liquidación de CDTs con penalizaciones
  - Conversión de divisas
  - Cálculo de calificaciones

### API REST
- **`backend/app/api/lotes.py`**: 5 endpoints de lotes
- **`backend/app/api/calculos.py`**: 5 endpoints de cálculos financieros

### Modelos de Datos
- **`backend/app/models/lote.py`**: Modelo Lote con:
  - Enum EstadoLote (VERDE/AMARILLO/ROJO)
  - Método `calcular_estado()`
  - Método `restar_cantidad()`
  - Property `porcentaje_disponible`

### Esquemas de Validación
- **`backend/app/schemas/lote_schemas.py`**: Validación de requests/responses de lotes
- **`backend/app/schemas/calculo_schemas.py`**: Validación de cálculos financieros

---

## Tecnologías Utilizadas

### Backend
- **FastAPI 0.109.0**: Framework web moderno
- **SQLAlchemy 2.0.25**: ORM para PostgreSQL
- **Pydantic 2.5.3**: Validación de datos
- **psycopg2-binary 2.9.9**: Driver PostgreSQL
- **Python Decimal**: Precisión financiera

### Base de Datos
- **PostgreSQL 14+**: Base de datos relacional
- **NUMERIC(18,2)**: Tipo para valores monetarios
- **NUMERIC(18,6)**: Tipo para cantidades de activos

### Herramientas
- **pytest**: Testing
- **uvicorn**: Servidor ASGI

---

## Características Implementadas

### Sistema de Lotes
- [x] Gestión de inventario por lotes
- [x] Estados de semáforo (Verde/Amarillo/Rojo)
- [x] Lógica FIFO para ventas
- [x] Actualización automática de estados
- [x] Trazabilidad completa

### Cálculos Financieros
- [x] Valoración de bonos (precio sucio)
- [x] Liquidación de CDTs con penalizaciones
- [x] Conversión de divisas
- [x] Cálculo de calificaciones

### Gestión de Caja
- [x] Validación de saldo disponible
- [x] Depósitos y retiros
- [x] Saldo en tiempo real

### API REST
- [x] 10+ endpoints funcionales
- [x] Documentación automática (Swagger)
- [x] Validación de entrada/salida
- [x] Manejo de errores

### Documentación
- [x] README completo
- [x] Guía de instalación
- [x] Validación de fórmulas matemáticas
- [x] Resumen de entregables
- [x] Ejemplos de uso

---

## Estadísticas del Proyecto

- **Archivos de código**: 25+
- **Líneas de código Python**: ~2,500+
- **Líneas de código SQL**: ~600+
- **Endpoints API**: 10
- **Modelos de datos**: 8
- **Servicios de negocio**: 2
- **Tests**: Estructura completa
- **Documentación**: 4 archivos MD

---

## Próximos Pasos

### Frontend (Pendiente)
- [ ] Aplicación React con Tailwind CSS
- [ ] Componentes de visualización de lotes
- [ ] Dashboard de portafolio
- [ ] Formularios de transacciones
- [ ] Gráficos de rendimiento

### Mejoras Backend
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Cache con Redis
- [ ] Containerización con Docker

### DevOps
- [ ] CI/CD con GitHub Actions
- [ ] Despliegue en cloud
- [ ] Monitoreo con Prometheus
- [ ] Backups automáticos

---

## Información de Contacto

**Proyecto**: Simulador de Portafolio de Inversiones  
**Stack**: Python + FastAPI + PostgreSQL + React (Futuro)  
**Estado**: Backend Completo  
**Versión**: 1.0.0

---

## Notas Adicionales

- Todos los cálculos financieros usan `Decimal` para precisión
- Sistema de triggers en PostgreSQL para estados automáticos
- Lógica FIFO implementada correctamente
- Fórmulas validadas matemáticamente
- Código documentado con docstrings
- Estructura modular y escalable

---

**Última actualización**: Diciembre 2024
