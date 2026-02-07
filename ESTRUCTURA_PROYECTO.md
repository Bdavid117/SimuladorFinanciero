# Estructura del Proyecto - Simulador Financiero

## Resumen Ejecutivo

Simulador de Portafolio de Inversiones Web completo con sistema de lotes, cálculos financieros avanzados y gestión de caja de ahorros.

---

## Árbol de Directorios

```text
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
├── start.bat                    # Script inicio Windows
├── start.ps1                    # Script inicio PowerShell
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
│   │   │   └── valoracion.py    # Modelo ValoracionDiaria
│   │   │
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── __init__.py
│   │   │   ├── lote_service.py        # Servicio de Lotes
│   │   │   └── calculo_service.py     # Servicio de Cálculos
│   │   │
│   │   ├── schemas/             # Esquemas Pydantic
│   │   │   ├── __init__.py
│   │   │   ├── lote_schemas.py        # Schemas de Lotes
│   │   │   └── calculo_schemas.py     # Schemas de Cálculos
│   │   │
│   │   └── api/                 # Endpoints REST
│   │       ├── __init__.py
│   │       ├── lotes.py               # Endpoints de Lotes
│   │       └── calculos.py            # Endpoints de Cálculos
│   │
│   └── tests/                   # Tests unitarios
│       ├── __init__.py
│       ├── conftest.py          # Configuración pytest
│       └── test_services.py     # Tests de servicios
│
├── frontend/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── ui/              # FormCard, InputField, etc.
│   │   │   └── layout/          # Sidebar, MainLayout
│   │   ├── pages/               # Páginas de la aplicación
│   │   │   ├── Dashboard/
│   │   │   ├── Lotes/
│   │   │   ├── Transacciones/
│   │   │   ├── Calculadoras/
│   │   │   └── Calificacion/
│   │   ├── services/            # Servicios API (Axios)
│   │   └── types/               # Tipos TypeScript
│   ├── vite.config.ts           # Configuración Vite + Tailwind
│   └── package.json             # Dependencias frontend
│
└── venv/                        # Entorno virtual Python
```

---

## Archivos Clave

### Base de Datos (PostgreSQL)

- **`database/schema.sql`**: Esquema completo con:
  - 11 tablas principales
  - 2 triggers automáticos (estado_lote, validar_saldo_caja)
  - 2 vistas (v_resumen_portafolio, v_lotes_disponibles)
  - Índices optimizados
  - Constraints de integridad referencial

### Aplicación Backend

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

### Frontend

- **React 19**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Vite 7**: Build tool y dev server
- **Tailwind CSS v4**: Estilos utilitarios
- **Recharts**: Gráficos interactivos
- **Axios**: Cliente HTTP

### Base de Datos PostgreSQL

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

### Endpoints REST

- [x] 10+ endpoints funcionales
- [x] Documentación automática (Swagger)
- [x] Validación de entrada/salida
- [x] Manejo de errores

### Frontend Web

- [x] Dashboard con estadísticas en tiempo real
- [x] Tabla de lotes con filtros por semáforo
- [x] Formularios de compra y venta
- [x] Calculadoras financieras (Bonos, CDTs, Divisas)
- [x] Calificación del portafolio

### Documentación

- [x] README completo
- [x] Guía de instalación
- [x] Validación de fórmulas matemáticas
- [x] Resumen de entregables
- [x] Ejemplos de uso

---

## Estadísticas del Proyecto

- **Archivos de código**: 40+
- **Líneas de código Python**: ~2,500+
- **Líneas de código TypeScript**: ~2,000+
- **Líneas de código SQL**: ~600+
- **Endpoints API**: 10
- **Páginas Frontend**: 8
- **Modelos de datos**: 8
- **Servicios de negocio**: 2
- **Documentación**: 5 archivos MD

---

## Próximos Pasos

### Mejoras Frontend

- [ ] Gráficos de rendimiento avanzados
- [ ] Exportación a PDF/Excel
- [ ] Sistema de alertas (vencimientos)
- [ ] Modo oscuro
- [ ] Diseño responsive mejorado

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

## Información del Proyecto

**Proyecto**: Simulador de Portafolio de Inversiones
**Stack**: Python + FastAPI + PostgreSQL + React + TypeScript + Tailwind
**Estado**: Backend y Frontend Completos
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

Última actualización: Febrero 2026
