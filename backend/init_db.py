import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
import sys
from dotenv import load_dotenv
from urllib.parse import urlparse

# Cargar variables de entorno
load_dotenv()

# Obtener URL de conexión o construirla
# Asumimos que DATABASE_URL tiene el formato: postgresql://user:password@host:port/dbname
DATABASE_URL = os.getenv("DATABASE_URL")

# Valores por defecto si no se puede parsear la URL (simple fallback)
DB_HOST = "localhost"
DB_USER = "postgres"
DB_PASS = "password" 
DB_PORT = "5432"
DB_NAME = "simulador_inversiones"

# Intentar parsear la URL si existe
if DATABASE_URL:
    try:
        # postgresql://user:password@host:port/dbname
        r = urlparse(DATABASE_URL)
        DB_HOST = r.hostname or DB_HOST
        DB_USER = r.username or DB_USER
        DB_PASS = r.password or DB_PASS
        DB_PORT = r.port or DB_PORT
        DB_NAME = r.path.lstrip('/') or DB_NAME
    except Exception:
        pass

# Ensure schema path is correct relative to this script
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database", "schema.sql")

def safe_print_error(e):
    """Imprime el error decodificándolo de manera segura para la consola de Windows."""
    try:
        # Intentar imprimir directamente en caso de que sea una cadena limpia
        print(f"❌ Error de Base de Datos: {e}")
    except Exception:
        # Si falla debido a encoding, usamos repr() que escapa los caracteres problemáticos
        print(f"❌ Error de Base de Datos (detalle seguro): {repr(e)}")

def init_db():
    print(f"🔌 Conectando a PostgreSQL en {DB_HOST}:{DB_PORT} como '{DB_USER}'...")
    
    # 1. Crear la Base de Datos (si no existe)
    try:
        # Conectar a 'postgres' (base de datos por defecto) para crear la nueva BD
        conn = psycopg2.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Verificar si existe nuestra BD objetivo
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"📦 Creando base de datos '{DB_NAME}'...")
            cur.execute(f"CREATE DATABASE {DB_NAME}")
        else:
            print(f"ℹ️ La base de datos '{DB_NAME}' ya existe.")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        safe_print_error(e)
        print("\n💡 SUGERENCIA:")
        print("   Por favor verifica el archivo '.env'.")
        print("   Asegúrate de que 'DATABASE_URL' tenga la contraseña correcta de tu instalación local de PostgreSQL.")
        print(f"   Contraseña usada: '{DB_PASS}' (¿Es esta tu contraseña?)")
        sys.exit(1)

    # 2. Ejecutar el Schema
    try:
        print(f"📄 Aplicando esquema desde {SCHEMA_PATH}...")
        
        # Conectar a la BD del simulador
        conn = psycopg2.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT,
            dbname=DB_NAME
        )
        cur = conn.cursor()
        
        if os.path.exists(SCHEMA_PATH):
            with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
                cur.execute(schema_sql)
            conn.commit()
            print("✅ Esquema aplicado exitosamente.")
        else:
            print(f"⚠️ No se encontró el archivo de esquema en: {SCHEMA_PATH}")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        safe_print_error(e)
        sys.exit(1)

if __name__ == "__main__":
    init_db()
