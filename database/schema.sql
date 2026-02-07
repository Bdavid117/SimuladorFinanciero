-- =====================================================================
-- SIMULADOR DE PORTAFOLIO DE INVERSIONES
-- Esquema de Base de Datos PostgreSQL
-- =====================================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- TABLA: usuarios
-- Gestión de usuarios del sistema
-- =====================================================================
CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================================
-- TABLA: caja_ahorros
-- Gestión del efectivo disponible por usuario
-- =====================================================================
CREATE TABLE caja_ahorros (
    id_caja UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    saldo_actual NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    moneda VARCHAR(3) DEFAULT 'COP', -- COP, USD, EUR, etc.
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT saldo_positivo CHECK (saldo_actual >= 0)
);

-- =====================================================================
-- TABLA: tipos_activos
-- Catálogo de tipos de activos financieros
-- =====================================================================
CREATE TABLE tipos_activos (
    id_tipo_activo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- 'ACCION', 'BONO', 'CDT', 'ETF', etc.
    descripcion TEXT,
    requiere_trm BOOLEAN DEFAULT FALSE, -- Si es activo extranjero
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================================
-- TABLA: activos
-- Catálogo de activos disponibles para inversión
-- =====================================================================
CREATE TABLE activos (
    id_activo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_tipo_activo INTEGER REFERENCES tipos_activos(id_tipo_activo),
    ticker VARCHAR(20) NOT NULL, -- Símbolo del activo (AAPL, MSFT, etc.)
    nombre VARCHAR(200) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'COP',
    mercado VARCHAR(50), -- NYSE, NASDAQ, BVC, etc.
    es_extranjero BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    -- Campos específicos para BONOS
    valor_nominal NUMERIC(18, 2),
    tasa_cupon NUMERIC(8, 4), -- Porcentaje (ej: 5.5 para 5.5%)
    frecuencia_cupon INTEGER, -- Veces al año (1=anual, 2=semestral, 4=trimestral)
    fecha_emision DATE,
    fecha_vencimiento DATE,
    -- Campos específicos para CDTs
    tasa_interes_anual NUMERIC(8, 4), -- Para CDTs
    plazo_dias INTEGER, -- Plazo en días
    CONSTRAINT ticker_unico UNIQUE (ticker, mercado)
);

-- =====================================================================
-- TABLA: lotes
-- Sistema de inventario por lotes (CORE del sistema)
-- =====================================================================
CREATE TABLE lotes (
    id_lote UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_activo UUID NOT NULL REFERENCES activos(id_activo),
    
    -- Cantidades
    cantidad_inicial NUMERIC(18, 6) NOT NULL,
    cantidad_disponible NUMERIC(18, 6) NOT NULL,
    
    -- Precios y costos (precisión decimal)
    precio_compra NUMERIC(18, 6) NOT NULL,
    comision_compra NUMERIC(18, 2) DEFAULT 0.00,
    trm NUMERIC(12, 6) DEFAULT 1.000000, -- TRM si es activo extranjero
    costo_total NUMERIC(18, 2) NOT NULL, -- (cantidad * precio * TRM) + comisión
    
    -- Fechas
    fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Estado del lote (calculado automáticamente)
    estado VARCHAR(10) NOT NULL DEFAULT 'VERDE', -- 'VERDE', 'AMARILLO', 'ROJO'
    
    -- Evidencia
    url_evidencia TEXT, -- URL o path de screenshot del precio
    
    -- Metadatos
    notas TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT cantidad_disponible_valida CHECK (cantidad_disponible >= 0 AND cantidad_disponible <= cantidad_inicial),
    CONSTRAINT precio_positivo CHECK (precio_compra > 0),
    CONSTRAINT estado_valido CHECK (estado IN ('VERDE', 'AMARILLO', 'ROJO'))
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_lotes_usuario ON lotes(id_usuario);
CREATE INDEX idx_lotes_activo ON lotes(id_activo);
CREATE INDEX idx_lotes_estado ON lotes(estado);
CREATE INDEX idx_lotes_fecha ON lotes(fecha_compra DESC);

-- =====================================================================
-- TABLA: transacciones
-- Registro histórico de todas las operaciones
-- =====================================================================
CREATE TABLE transacciones (
    id_transaccion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_activo UUID NOT NULL REFERENCES activos(id_activo),
    
    tipo_operacion VARCHAR(20) NOT NULL, -- 'COMPRA', 'VENTA', 'DEPOSITO', 'RETIRO'
    
    cantidad NUMERIC(18, 6) NOT NULL,
    precio NUMERIC(18, 6),
    comision NUMERIC(18, 2) DEFAULT 0.00,
    trm NUMERIC(12, 6) DEFAULT 1.000000,
    
    -- Montos
    monto_operacion NUMERIC(18, 2) NOT NULL, -- Valor total de la operación
    saldo_caja_antes NUMERIC(18, 2),
    saldo_caja_despues NUMERIC(18, 2),
    
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Referencias
    id_lote UUID REFERENCES lotes(id_lote), -- Lote afectado (para ventas)
    
    -- Evidencia
    url_evidencia TEXT,
    notas TEXT,
    
    CONSTRAINT tipo_operacion_valido CHECK (tipo_operacion IN ('COMPRA', 'VENTA', 'DEPOSITO', 'RETIRO', 'LIQUIDACION_CDT'))
);

CREATE INDEX idx_transacciones_usuario ON transacciones(id_usuario);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha_transaccion DESC);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo_operacion);

-- =====================================================================
-- TABLA: valoraciones_diarias
-- Snapshot diario de la valoración del portafolio
-- =====================================================================
CREATE TABLE valoraciones_diarias (
    id_valoracion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    
    fecha_valoracion DATE NOT NULL,
    
    -- Valores agregados
    valor_mercado_total NUMERIC(18, 2) NOT NULL,
    costo_total_invertido NUMERIC(18, 2) NOT NULL,
    ganancia_perdida NUMERIC(18, 2),
    rentabilidad_porcentaje NUMERIC(8, 4),
    
    -- Saldo en caja
    efectivo_disponible NUMERIC(18, 2),
    
    -- Metadatos
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valoracion_unica_diaria UNIQUE (id_usuario, fecha_valoracion)
);

-- =====================================================================
-- TABLA: parametros_sistema
-- Configuración del sistema (parámetros del Admin)
-- =====================================================================
CREATE TABLE parametros_sistema (
    id_parametro SERIAL PRIMARY KEY,
    nombre_parametro VARCHAR(100) NOT NULL UNIQUE,
    valor_parametro TEXT NOT NULL,
    tipo_dato VARCHAR(20) NOT NULL, -- 'NUMERIC', 'TEXT', 'BOOLEAN', 'DATE'
    descripcion TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parámetros iniciales
INSERT INTO parametros_sistema (nombre_parametro, valor_parametro, tipo_dato, descripcion) VALUES
    ('PENALIZACION_CDT_60_DIAS', '0.10', 'NUMERIC', 'Penalización 10% para CDTs liquidados <= 60 días'),
    ('PENALIZACION_CDT_MAS_60_DIAS', '0.20', 'NUMERIC', 'Penalización 20% para CDTs liquidados > 60 días'),
    ('META_RENDIMIENTO', '0.15', 'NUMERIC', 'Meta de rendimiento del Admin (15%)'),
    ('COMISION_VENTA_DEFECTO', '0.01', 'NUMERIC', 'Comisión por defecto en ventas (1%)'),
    ('TRM_ACTUAL', '4800.00', 'NUMERIC', 'Tasa de cambio actual COP/USD');

-- =====================================================================
-- TABLA: calculos_bonos
-- Histórico de cálculos de valoración de bonos
-- =====================================================================
CREATE TABLE calculos_bonos (
    id_calculo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_activo UUID NOT NULL REFERENCES activos(id_activo),
    id_usuario UUID REFERENCES usuarios(id_usuario),
    
    fecha_calculo DATE NOT NULL,
    tir NUMERIC(8, 6) NOT NULL, -- Tasa Interna de Retorno
    
    precio_limpio NUMERIC(18, 2),
    cupon_acumulado NUMERIC(18, 2),
    precio_sucio NUMERIC(18, 2), -- Precio limpio + cupón acumulado
    
    dias_desde_ultimo_cupon INTEGER,
    
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- FUNCIÓN: actualizar_estado_lote
-- Actualiza automáticamente el estado del lote según el semáforo
-- =====================================================================
CREATE OR REPLACE FUNCTION actualizar_estado_lote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cantidad_disponible = NEW.cantidad_inicial THEN
        NEW.estado := 'VERDE';
    ELSIF NEW.cantidad_disponible > 0 AND NEW.cantidad_disponible < NEW.cantidad_inicial THEN
        NEW.estado := 'AMARILLO';
    ELSIF NEW.cantidad_disponible = 0 THEN
        NEW.estado := 'ROJO';
    END IF;
    
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado automáticamente
CREATE TRIGGER trg_actualizar_estado_lote
    BEFORE INSERT OR UPDATE OF cantidad_disponible ON lotes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_lote();

-- =====================================================================
-- FUNCIÓN: validar_saldo_caja
-- Valida que haya saldo suficiente antes de una compra
-- =====================================================================
CREATE OR REPLACE FUNCTION validar_saldo_caja()
RETURNS TRIGGER AS $$
DECLARE
    saldo_disponible NUMERIC(18, 2);
BEGIN
    IF NEW.tipo_operacion = 'COMPRA' THEN
        SELECT saldo_actual INTO saldo_disponible
        FROM caja_ahorros
        WHERE id_usuario = NEW.id_usuario;
        
        IF saldo_disponible < NEW.monto_operacion THEN
            RAISE EXCEPTION 'Saldo insuficiente. Disponible: %, Requerido: %', 
                saldo_disponible, NEW.monto_operacion;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar saldo
CREATE TRIGGER trg_validar_saldo_caja
    BEFORE INSERT ON transacciones
    FOR EACH ROW
    EXECUTE FUNCTION validar_saldo_caja();

-- =====================================================================
-- VISTAS ÚTILES
-- =====================================================================

-- Vista: Resumen de portafolio por usuario
CREATE VIEW v_resumen_portafolio AS
SELECT 
    u.id_usuario,
    u.nombre AS nombre_usuario,
    a.ticker,
    a.nombre AS nombre_activo,
    ta.nombre AS tipo_activo,
    SUM(l.cantidad_disponible) AS cantidad_total,
    AVG(l.precio_compra) AS precio_promedio_compra,
    SUM(l.costo_total) AS inversion_total,
    COUNT(l.id_lote) AS numero_lotes,
    SUM(CASE WHEN l.estado = 'VERDE' THEN 1 ELSE 0 END) AS lotes_verdes,
    SUM(CASE WHEN l.estado = 'AMARILLO' THEN 1 ELSE 0 END) AS lotes_amarillos,
    SUM(CASE WHEN l.estado = 'ROJO' THEN 1 ELSE 0 END) AS lotes_rojos
FROM usuarios u
JOIN lotes l ON u.id_usuario = l.id_usuario
JOIN activos a ON l.id_activo = a.id_activo
JOIN tipos_activos ta ON a.id_tipo_activo = ta.id_tipo_activo
WHERE l.cantidad_disponible > 0
GROUP BY u.id_usuario, u.nombre, a.ticker, a.nombre, ta.nombre;

-- Vista: Lotes disponibles para venta
CREATE VIEW v_lotes_disponibles AS
SELECT 
    l.id_lote,
    l.id_usuario,
    l.id_activo,
    a.ticker,
    a.nombre AS nombre_activo,
    l.cantidad_disponible,
    l.precio_compra,
    l.costo_total,
    l.fecha_compra,
    l.estado
FROM lotes l
JOIN activos a ON l.id_activo = a.id_activo
WHERE l.cantidad_disponible > 0
ORDER BY l.fecha_compra ASC; -- FIFO

-- =====================================================================
-- DATOS DE PRUEBA
-- =====================================================================

-- Tipos de activos
INSERT INTO tipos_activos (nombre, descripcion, requiere_trm) VALUES
    ('ACCION', 'Acciones de empresas', FALSE),
    ('BONO', 'Bonos gubernamentales o corporativos', FALSE),
    ('CDT', 'Certificados de Depósito a Término', FALSE),
    ('ETF', 'Fondos cotizados', FALSE),
    ('ACCION_EXT', 'Acciones extranjeras', TRUE);

-- Usuario de prueba
INSERT INTO usuarios (nombre, email, password_hash) VALUES
    ('Usuario Demo', 'demo@simulador.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMCbr8g9U2i'); -- password: demo123

-- Caja de ahorros inicial
INSERT INTO caja_ahorros (id_usuario, saldo_actual, moneda) 
SELECT id_usuario, 10000000.00, 'COP' 
FROM usuarios WHERE email = 'demo@simulador.com';

-- Activos de ejemplo
INSERT INTO activos (id_tipo_activo, ticker, nombre, moneda, mercado, es_extranjero) VALUES
    (1, 'ECOPETROL', 'Ecopetrol S.A.', 'COP', 'BVC', FALSE),
    (1, 'BANCOLOMBIA', 'Bancolombia S.A.', 'COP', 'BVC', FALSE),
    (5, 'AAPL', 'Apple Inc.', 'USD', 'NASDAQ', TRUE),
    (5, 'MSFT', 'Microsoft Corporation', 'USD', 'NASDAQ', TRUE);

-- Bono de ejemplo
INSERT INTO activos (
    id_tipo_activo, ticker, nombre, moneda, mercado, es_extranjero,
    valor_nominal, tasa_cupon, frecuencia_cupon, fecha_emision, fecha_vencimiento
) VALUES (
    2, 'TES2030', 'TES Tasa Fija 2030', 'COP', 'BVC', FALSE,
    1000000.00, 7.25, 2, '2024-01-01', '2030-01-01'
);

-- CDT de ejemplo
INSERT INTO activos (
    id_tipo_activo, ticker, nombre, moneda, mercado, es_extranjero,
    valor_nominal, tasa_interes_anual, plazo_dias
) VALUES (
    3, 'CDT-BCOL-90', 'CDT Bancolombia 90 días', 'COP', 'CDT', FALSE,
    1000000.00, 12.50, 90
);

COMMENT ON TABLE lotes IS 'Tabla principal del sistema de inventario por lotes. Cada compra genera un lote único.';
COMMENT ON COLUMN lotes.estado IS 'VERDE: 100% disponible, AMARILLO: parcialmente vendido, ROJO: totalmente vendido';
COMMENT ON TABLE transacciones IS 'Registro inmutable de todas las operaciones del sistema';
COMMENT ON TABLE parametros_sistema IS 'Parámetros configurables por el administrador del sistema';
