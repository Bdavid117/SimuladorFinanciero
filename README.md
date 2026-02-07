# Simulador de Portafolio de Inversiones

Sistema web para gestión de portafolios de inversión con arquitectura de lotes, cálculos financieros avanzados y sistema de calificación.

## Características Principales

### 1. Arquitectura de Lotes (Inventario)

- Sistema de gestión por lotes FIFO
- Estados visuales (Semáforo):
  - **Verde**: Lote completo disponible
  - **Amarillo**: Lote parcialmente vendido
  - **Rojo**: Lote totalmente vendido
- Trazabilidad completa de cada compra

### 2. Motor de Cálculos Financieros

- **Valoración de Bonos** (Precio Sucio)
  - Cálculo de cupón acumulado
  - TIR personalizable
  - Soporte para bonos con cupones semestrales/trimestrales

- **Liquidación de CDTs**
  - Cálculo de intereses compuestos
  - Penalizaciones parametrizables:
    - 10% para liquidación ≤ 60 días
    - 20% para liquidación > 60 días

- **Conversión de Divisas**
  - Cálculo automático con TRM
  - Soporte para activos extranjeros

### 3. Sistema de Caja de Ahorros

- Control de efectivo disponible
- Validación automática de saldo antes de compras
- Registro de todas las transacciones

### 4. Sistema de Calificación

- Calificación automática al liquidar portafolio
- Fórmula: `Nota = (Rendimiento Real / Meta Admin) × 5.0`
- Meta parametrizable por el administrador

## Stack Tecnológico

### Backend

- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos con precisión decimal
- **Pydantic**: Validación de datos

### Frontend

- **React**: Librería UI con TypeScript
- **Vite**: Bundler ultrarrápido
- **Tailwind CSS**: Estilos y sistema de colores
- **Recharts**: Gráficos interactivos

## Estructura del Proyecto

```text
SimuladorFinanciero/
├── database/
│   └── schema.sql
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── api/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt
├── start.bat
├── start.ps1
├── .env.example
└── README.md
```

## Instalación

### 1. Clonar y configurar entorno

```bash
cd SimuladorFinanciero

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias del backend
pip install -r requirements.txt

# Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos en PostgreSQL
psql -U postgres
CREATE DATABASE simulador_inversiones;
\q

# Ejecutar esquema
psql -U postgres -d simulador_inversiones -f database/schema.sql
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
```

### 4. Ejecutar la aplicación

```bash
# Opción 1: Script automático (Windows)
start.bat
# o en PowerShell:
.\start.ps1

# Opción 2: Manual
# Terminal 1 - Backend:
set PYTHONPATH=backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- API Docs: `http://localhost:8000/docs`

## Fórmulas Financieras Implementadas

### Valoración de Bonos (Precio Sucio)

$$Precio = \sum_{t=1}^{n} \frac{Cupón}{(1+TIR)^t} + \frac{Nominal}{(1+TIR)^n} + Cupón\ Acumulado$$

### CDTs con Interés Compuesto

$$I = P \times \left((1 + i)^{\frac{n}{365}} - 1\right)$$

Con penalización:

- 10% si $n \leq 60$ días
- 20% si $n > 60$ días

### Conversión de Divisas

$$Costo\ Total = (Cantidad \times Precio \times TRM) + Comisión$$

## API Endpoints

### Lotes

- `POST /api/lotes/comprar` — Crear nuevo lote (compra)
- `POST /api/lotes/vender` — Vender desde lotes disponibles (FIFO)
- `GET /api/lotes/usuario/{id_usuario}` — Obtener lotes por usuario
- `GET /api/lotes/usuario/{id_usuario}/resumen` — Resumen por activo
- `GET /api/lotes/usuario/{id_usuario}/estadisticas` — Dashboard estadísticas

### Cálculos Financieros

- `POST /api/calculos/bono/precio-sucio` — Calcular precio de bono
- `POST /api/calculos/bono/desde-activo` — Calcular bono desde activo
- `POST /api/calculos/cdt/liquidar` — Liquidar CDT con penalización
- `POST /api/calculos/divisa/convertir` — Convertir divisa
- `POST /api/calculos/calificacion` — Calificar portafolio

## Testing

```bash
# Ejecutar tests
pytest backend/tests/

# Con cobertura
pytest --cov=app backend/tests/
```

## Ejemplos de Uso

### Comprar Activo

```json
{
  "id_usuario": "550e8400-e29b-41d4-a716-446655440000",
  "id_activo": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cantidad": 100,
  "precio_compra": 25000,
  "comision": 250,
  "trm": 1.0
}
```

### Vender Activo (FIFO)

```json
{
  "id_usuario": "550e8400-e29b-41d4-a716-446655440000",
  "id_activo": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cantidad": 50,
  "precio_venta": 27000,
  "comision": 270
}
```

## Licencia

Este proyecto es privado y confidencial.

---

Desarrollado por el equipo de Ingeniería Financiera
