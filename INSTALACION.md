# =====================================================================
# GUÍA DE INSTALACIÓN Y DESPLIEGUE
# Simulador de Portafolio de Inversiones
# =====================================================================

## Requisitos Previos

### Software Necesario
- **Python 3.9+**: [Descargar](https://www.python.org/downloads/)
- **PostgreSQL 14+**: [Descargar](https://www.postgresql.org/download/)
- **Git** (opcional): Para clonar el repositorio

### Conocimientos Recomendados
- Básicos de Python
- SQL y bases de datos relacionales
- Conceptos de APIs REST

---

## Instalación Rápida

### Windows

```batch
# 1. Ejecutar script de instalación
install.bat

# 2. Configurar PostgreSQL
# Abrir pgAdmin o terminal psql

# 3. Crear base de datos
CREATE DATABASE simulador_inversiones;

# 4. Ejecutar esquema
psql -U postgres -d simulador_inversiones -f database\schema.sql

# 5. Iniciar servidor
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Linux/Mac

```bash
# 1. Dar permisos al script
chmod +x install.sh

# 2. Ejecutar instalación
./install.sh

# 3. Configurar PostgreSQL
createdb simulador_inversiones
psql -d simulador_inversiones -f database/schema.sql

# 4. Iniciar servidor
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

## Instalación Manual Paso a Paso

### 1. Preparar Entorno Python

```bash
# Crear directorio
mkdir SimuladorFinanciero
cd SimuladorFinanciero

# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate
# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar Base de Datos

Asegúrate de tener PostgreSQL corriendo:

```sql
-- Conectar a Postgres
-- psql -U postgres

-- Crear base de datos
CREATE DATABASE simulador_inversiones;

-- Conectar a la BD
\c simulador_inversiones

-- Ejecutar el script SCHEMA.SQL
-- \i database/schema.sql
```

### 3. Variables de Entorno

Crear archivo `.env` en la raíz:

```ini
DATABASE_URL=postgresql://postgres:password@localhost:5432/simulador_inversiones
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=True
```

### 4. Ejecutar la Aplicación

```bash
# Desde la carpeta raíz
cd backend
uvicorn app.main:app --reload
```

La aplicación estará disponible en `http://localhost:8000`

---

## Verificación de Instalación

1. Abrir navegador en `http://localhost:8000/docs`
2. Deberías ver la documentación Swagger
3. Probar endpoint `GET /health`
4. Respuesta esperada: `{"status": "healthy"}`

---

## Solución de Problemas Comunes

### Error: "psql not recognized"
- Asegúrate de agregar la carpeta bin de PostgreSQL al PATH del sistema

### Error: "Connection refused"
- Verifica que el servicio de PostgreSQL esté corriendo
- Revisa las credenciales en `.env`

### Error: "Module not found"
- Verifica que el entorno virtual esté activado (`(venv)` en la terminal)
- Reinstala dependencias: `pip install -r requirements.txt`
