# Simulador de Portafolio de Inversiones

Sistema web para gestión de portafolios de inversión con arquitectura de lotes, cálculos financieros avanzados y sistema de calificación.

## Características Principales

### 1. **Arquitectura de Lotes (Inventario)**
- Sistema de gestión por lotes FIFO
- Estados visuales (Semáforo):
  - **Verde**: Lote completo disponible
  - **Amarillo**: Lote parcialmente vendido
  - **Rojo**: Lote totalmente vendido
- Trazabilidad completa de cada compra

### 2. **Motor de Cálculos Financieros**
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

### 3. **Sistema de Caja de Ahorros**
- Control de efectivo disponible
- Validación automática de saldo antes de compras
- Registro de todas las transacciones

### 4. **Sistema de Calificación**
- Calificación automática al liquidar portafolio
- Fórmula: `Nota = (Rendimiento Real / Meta Admin) × 5.0`
- Meta parametrizable por el administrador

## Stack Tecnológico

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos con precisión decimal
- **Pydantic**: Validación de datos

### Frontend (Recomendado)
- **React**: Librería UI
- **Tailwind CSS**: Estilos y sistema de colores
- **TypeScript**: Tipado estático

## Estructura del Proyecto

```
SimuladorFinanciero/
├── database/
│   └── schema.sql              # Esquema completo de la BD
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Punto de entrada FastAPI
│   │   ├── config.py          # Configuración
│   │   ├── models/            # Modelos SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── usuario.py
│   │   │   ├── lote.py
│   │   │   ├── activo.py
│   │   │   ├── transaccion.py
│   │   │   └── caja.py
│   │   ├── schemas/           # Schemas Pydantic
│   │   │   ├── __init__.py
│   │   │   ├── lote.py
│   │   │   ├── transaccion.py
│   │   │   └── activo.py
│   │   ├── services/          # Lógica de negocio
│   │   │   ├── __init__.py
│   │   │   ├── lote_service.py
│   │   │   ├── calculo_service.py
│   │   │   └── transaccion_service.py
│   │   ├── api/               # Endpoints
│   │   │   ├── __init__.py
│   │   │   ├── lotes.py
│   │   │   ├── transacciones.py
│   │   │   └── activos.py
│   │   └── database.py        # Conexión DB
│   └── tests/                 # Tests unitarios
├── requirements.txt
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

# Instalar dependencias
pip install -r requirements.txt
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

# Editar .env con tus credenciales
```

### 4. Ejecutar la aplicación

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

La API estará disponible en: `http://localhost:8000`
Documentación interactiva: `http://localhost:8000/docs`

## Esquema de Base de Datos

### Tablas Principales

1. **lotes**: Sistema de inventario por lotes
2. **transacciones**: Registro histórico de operaciones
3. **activos**: Catálogo de instrumentos financieros
4. **caja_ahorros**: Control de efectivo por usuario
5. **parametros_sistema**: Configuración del sistema

### Características Especiales

- **Triggers automáticos** para actualizar estados de lotes
- **Validación de saldo** antes de compras
- **Precisión decimal** (`NUMERIC`) para cálculos financieros
- **Índices optimizados** para consultas rápidas
- **Vistas materializadas** para reportes

## Fórmulas Financieras Implementadas

### Valoración de Bonos (Precio Sucio)

$$Precio = \sum_{t=1}^{n} \frac{Cupón}{(1+TIR)^t} + \frac{Nominal}{(1+TIR)^n} + Cupón \ Acumulado$$

### CDTs con Interés Compuesto

$$I = P \times \left((1 + i)^{\frac{n}{365}} - 1\right)$$

Con penalización:
- 10% si $n \leq 60$ días
- 20% si $n > 60$ días

### Conversión de Divisas

$$Costo \ Total = (Cantidad \times Precio \times TRM) + Comisión$$

## API Endpoints

### Lotes
- `POST /api/lotes/comprar` - Crear nuevo lote (compra)
- `POST /api/lotes/vender` - Vender desde lotes disponibles
- `GET /api/lotes/usuario/{id}` - Obtener lotes por usuario
- `GET /api/lotes/{id}/estado` - Consultar estado de un lote

### Transacciones
- `GET /api/transacciones/usuario/{id}` - Histórico de transacciones
- `POST /api/transacciones/deposito` - Depositar efectivo
- `POST /api/transacciones/retiro` - Retirar efectivo

### Cálculos Financieros
- `POST /api/calculos/bono/precio-sucio` - Calcular precio de bono
- `POST /api/calculos/cdt/liquidar` - Liquidar CDT con penalización
- `POST /api/calculos/divisa/convertir` - Convertir divisa

### Portafolio
- `GET /api/portafolio/resumen/{id_usuario}` - Resumen del portafolio
- `GET /api/portafolio/valoracion/{id_usuario}` - Valoración actual
- `POST /api/portafolio/liquidar` - Liquidar todo a efectivo y calificar

## Sistema de Colores (Frontend)

```javascript
// Tailwind CSS classes para estados de lotes
const estadoColors = {
  VERDE: 'bg-green-500 text-white',    // Lote completo
  AMARILLO: 'bg-yellow-500 text-black', // Lote parcial
  ROJO: 'bg-red-500 text-white'        // Lote agotado
};
```

## Testing

```bash
# Ejecutar tests
pytest backend/tests/

# Con cobertura
pytest --cov=app backend/tests/
```

## Ejemplos de Uso

### Comprar Activo

```python
# POST /api/lotes/comprar
{
  "id_usuario": "uuid-del-usuario",
  "id_activo": "uuid-del-activo",
  "cantidad": 100,
  "precio_compra": 25000,
  "comision": 250,
  "trm": 1.0,
  "url_evidencia": "https://ejemplo.com/screenshot.png"
}
```

### Vender Activo (automático desde lotes FIFO)

```python
# POST /api/lotes/vender
{
  "id_usuario": "uuid-del-usuario",
  "id_activo": "uuid-del-activo",
  "cantidad": 50,
  "precio_venta": 27000,
  "comision": 270
}
```

## Seguridad

- Autenticación JWT
- Hash de contraseñas con bcrypt
- Validación de datos con Pydantic
- CORS configurado
- Variables de entorno para secretos

## Próximas Características

- [ ] Dashboard con gráficos de rendimiento
- [ ] Exportación de reportes en PDF
- [ ] Notificaciones de vencimiento de bonos/CDTs
- [ ] API de precios en tiempo real
- [ ] Soporte para más tipos de activos (opciones, futuros)

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y confidencial.

## Contacto

Para preguntas o soporte: demo@simulador.com

---

**Desarrollado por el equipo de Ingeniería Financiera**
