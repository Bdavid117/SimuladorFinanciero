#!/bin/bash

# =====================================================================
# Script de instalación y configuración del Simulador de Inversiones
# =====================================================================

echo "🎯 Simulador de Portafolio de Inversiones"
echo "=========================================="
echo ""

# Verificar Python
echo "📋 Verificando Python..."
python --version
if [ $? -ne 0 ]; then
    echo "❌ Error: Python no está instalado"
    exit 1
fi
echo "✅ Python encontrado"
echo ""

# Crear entorno virtual
echo "📦 Creando entorno virtual..."
python -m venv venv
echo "✅ Entorno virtual creado"
echo ""

# Activar entorno virtual (Linux/Mac)
echo "🔧 Activando entorno virtual..."
source venv/bin/activate
echo "✅ Entorno activado"
echo ""

# Instalar dependencias
echo "📥 Instalando dependencias..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"
echo ""

# Crear archivo .env
echo "⚙️  Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado (recuerda configurar tus credenciales)"
else
    echo "ℹ️  Archivo .env ya existe"
fi
echo ""

# Mensaje final
echo "=========================================="
echo "✅ Instalación completada"
echo "=========================================="
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Configurar PostgreSQL:"
echo "   psql -U postgres"
echo "   CREATE DATABASE simulador_inversiones;"
echo "   \\q"
echo ""
echo "2. Ejecutar esquema de base de datos:"
echo "   psql -U postgres -d simulador_inversiones -f database/schema.sql"
echo ""
echo "3. Configurar archivo .env con tus credenciales"
echo ""
echo "4. Iniciar el servidor:"
echo "   cd backend"
echo "   uvicorn app.main:app --reload"
echo ""
echo "5. Visitar la documentación:"
echo "   http://localhost:8000/docs"
echo ""
