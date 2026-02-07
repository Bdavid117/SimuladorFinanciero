# =====================================================================
# EJEMPLO DE USO DEL SIMULADOR DE INVERSIONES
# Script de demostración con casos de uso reales
# =====================================================================

"""
Este archivo demuestra cómo usar las principales funcionalidades
del Simulador de Inversiones
"""

import requests
import json
from decimal import Decimal
from datetime import date, datetime

# URL base de la API
BASE_URL = "http://localhost:8000"

# =====================================================================
# EJEMPLO 1: COMPRAR UN ACTIVO (CREAR LOTE)
# =====================================================================

def ejemplo_compra():
    print("\n" + "="*70)
    print("EJEMPLO 1: COMPRA DE ACTIVO (Creación de Lote)")
    print("="*70)
    
    # Datos de compra
    compra_data = {
        "id_usuario": "550e8400-e29b-41d4-a716-446655440000",  # Reemplazar con UUID real
        "id_activo": "660e8400-e29b-41d4-a716-446655440000",   # Reemplazar con UUID real
        "cantidad": 100,
        "precio_compra": 25000,
        "comision": 250,
        "trm": 1.0,
        "url_evidencia": "https://ejemplo.com/screenshot.png",
        "notas": "Compra de 100 acciones de Ecopetrol"
    }
    
    print(f"\nDatos de compra:")
    print(json.dumps(compra_data, indent=2))
    
    print(f"\nCosto total: {(compra_data['cantidad'] * compra_data['precio_compra']) + compra_data['comision']:,} COP")
    print(f"Estado inicial: VERDE (lote completo)")
    
    # Hacer la petición
    # response = requests.post(f"{BASE_URL}/api/lotes/comprar", json=compra_data)
    # print(f"\nRespuesta: {response.json()}")

# =====================================================================
# EJEMPLO 2: VENDER UN ACTIVO (SISTEMA FIFO)
# =====================================================================

def ejemplo_venta():
    print("\n" + "="*70)
    print("EJEMPLO 2: VENTA DE ACTIVO (Sistema FIFO)")
    print("="*70)
    
    venta_data = {
        "id_usuario": "550e8400-e29b-41d4-a716-446655440000",
        "id_activo": "660e8400-e29b-41d4-a716-446655440000",
        "cantidad": 50,
        "precio_venta": 27000,
        "comision": 270,
        "trm": 1.0
    }
    
    print(f"\nDatos de venta:")
    print(json.dumps(venta_data, indent=2))
    
    print(f"\nMonto de venta: {(venta_data['cantidad'] * venta_data['precio_venta']) - venta_data['comision']:,} COP")
    print(f"Estado después: AMARILLO (lote parcial)")
    
    ganancia = (venta_data['precio_venta'] - 25000) * venta_data['cantidad'] - venta_data['comision'] - 250
    print(f"Ganancia estimada: {ganancia:,} COP")

# =====================================================================
# EJEMPLO 3: CALCULAR PRECIO DE BONO
# =====================================================================

def ejemplo_bono():
    print("\n" + "="*70)
    print("EJEMPLO 3: VALORACIÓN DE BONO (Precio Sucio)")
    print("="*70)
    
    bono_data = {
        "valor_nominal": 1000000,
        "tasa_cupon": 7.25,          # 7.25% anual
        "frecuencia_cupon": 2,        # Semestral
        "tir": 8.5,                   # TIR deseada 8.5%
        "fecha_emision": "2024-01-01",
        "fecha_vencimiento": "2030-01-01",
        "fecha_valoracion": "2026-02-06"
    }
    
    print(f"\nParámetros del bono:")
    print(json.dumps(bono_data, indent=2))
    
    print(f"\nFórmula aplicada:")
    print(f"Precio = Σ(Cupón/(1+TIR)^t) + Nominal/(1+TIR)^n + Cupón Acumulado")
    
    print(f"\nExplicación:")
    print(f"  • Valor nominal: ${bono_data['valor_nominal']:,}")
    print(f"  • Cupón semestral: ${(bono_data['valor_nominal'] * bono_data['tasa_cupon'] / 100) / 2:,.2f}")
    print(f"  • Periodos restantes: ~8 semestres")
    print(f"  • TIR objetivo: {bono_data['tir']}%")
    
    print(f"\nResultado esperado:")
    print(f"  • Precio limpio: ~$970,000")
    print(f"  • Cupón acumulado: ~$12,000")
    print(f"  • Precio sucio: ~$982,000")

# =====================================================================
# EJEMPLO 4: LIQUIDAR CDT CON PENALIZACIÓN
# =====================================================================

def ejemplo_cdt():
    print("\n" + "="*70)
    print("EJEMPLO 4: LIQUIDACIÓN DE CDT CON PENALIZACIÓN")
    print("="*70)
    
    cdt_data = {
        "capital_invertido": 10000000,
        "tasa_interes_anual": 12.5,
        "fecha_inicio": "2025-11-01",
        "fecha_liquidacion": "2026-02-06",
        "plazo_dias_original": 90
    }
    
    dias_transcurridos = (datetime.strptime(cdt_data["fecha_liquidacion"], "%Y-%m-%d") - 
                         datetime.strptime(cdt_data["fecha_inicio"], "%Y-%m-%d")).days
    
    print(f"\nDatos del CDT:")
    print(json.dumps(cdt_data, indent=2))
    print(f"\nDías transcurridos: {dias_transcurridos} de {cdt_data['plazo_dias_original']}")
    
    print(f"\nFórmula de interés compuesto:")
    print(f"I = P × ((1 + i)^(n/365) - 1)")
    
    # Cálculo aproximado
    tasa_decimal = cdt_data["tasa_interes_anual"] / 100
    interes_bruto = cdt_data["capital_invertido"] * (((1 + tasa_decimal) ** (dias_transcurridos/365)) - 1)
    
    penalizacion = "20%" if dias_transcurridos > 60 else "10%"
    penalizacion_valor = interes_bruto * (0.20 if dias_transcurridos > 60 else 0.10)
    interes_neto = interes_bruto - penalizacion_valor
    
    print(f"\nCálculo:")
    print(f"  • Interés bruto: ${interes_bruto:,.2f}")
    print(f"  • Penalización ({penalizacion}): -${penalizacion_valor:,.2f}")
    print(f"  • Interés neto: ${interes_neto:,.2f}")
    print(f"  • Total a recibir: ${cdt_data['capital_invertido'] + interes_neto:,.2f}")

# =====================================================================
# EJEMPLO 5: CONVERSIÓN DE DIVISA
# =====================================================================

def ejemplo_divisa():
    print("\n" + "="*70)
    print("EJEMPLO 5: CONVERSIÓN DE DIVISA (Activo Extranjero)")
    print("="*70)
    
    divisa_data = {
        "cantidad": 100,
        "precio_unitario": 150.25,   # USD
        "trm": 4800.00,               # COP/USD
        "comision": 50000             # COP
    }
    
    print(f"\nDatos de conversión:")
    print(json.dumps(divisa_data, indent=2))
    
    print(f"\nFórmula:")
    print(f"Costo Total = (Cantidad × Precio × TRM) + Comisión")
    
    costo_usd = divisa_data["cantidad"] * divisa_data["precio_unitario"]
    costo_cop = costo_usd * divisa_data["trm"]
    costo_total = costo_cop + divisa_data["comision"]
    
    print(f"\nCálculo:")
    print(f"  • Costo en USD: ${costo_usd:,.2f}")
    print(f"  • TRM aplicada: ${divisa_data['trm']:,.2f}")
    print(f"  • Costo en COP (sin comisión): ${costo_cop:,.0f}")
    print(f"  • Comisión: ${divisa_data['comision']:,.0f}")
    print(f"  • Costo total: ${costo_total:,.0f}")

# =====================================================================
# EJEMPLO 6: SISTEMA DE CALIFICACIÓN
# =====================================================================

def ejemplo_calificacion():
    print("\n" + "="*70)
    print("EJEMPLO 6: CALIFICACIÓN DEL PORTAFOLIO")
    print("="*70)
    
    print(f"\nFórmula:")
    print(f"Nota = (Rendimiento Real / Meta Admin) × 5.0")
    
    ejemplos = [
        {"nombre": "Portafolio Excelente", "rendimiento": 0.20, "meta": 0.15},
        {"nombre": "Portafolio Bueno", "rendimiento": 0.14, "meta": 0.15},
        {"nombre": "Portafolio Insuficiente", "rendimiento": 0.08, "meta": 0.15}
    ]
    
    for ej in ejemplos:
        nota = (ej["rendimiento"] / ej["meta"]) * 5.0
        nota = min(nota, 5.0)
        
        if nota >= 4.5:
            calif = "Excelente (5 estrellas)"
        elif nota >= 4.0:
            calif = "Sobresaliente (4 estrellas)"
        elif nota >= 3.5:
            calif = "Bueno (3 estrellas)"
        elif nota >= 3.0:
            calif = "Aceptable (2 estrellas)"
        else:
            calif = "Insuficiente (1 estrella)"
        
        print(f"\n{ej['nombre']}:")
        print(f"  • Rendimiento: {ej['rendimiento']*100:.1f}%")
        print(f"  • Meta: {ej['meta']*100:.1f}%")
        print(f"  • Nota: {nota:.2f}/5.0")
        print(f"  • Calificación: {calif}")

# =====================================================================
# EJECUTAR EJEMPLOS
# =====================================================================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("SIMULADOR DE PORTAFOLIO DE INVERSIONES")
    print("Ejemplos de Uso de las Funcionalidades Principales")
    print("="*70)
    
    ejemplo_compra()
    ejemplo_venta()
    ejemplo_bono()
    ejemplo_cdt()
    ejemplo_divisa()
    ejemplo_calificacion()
    
    print("\n" + "="*70)
    print("EJEMPLOS COMPLETADOS")
    print("="*70)
    print(f"\nPara probar la API real:")
    print(f"   1. Iniciar el servidor: uvicorn app.main:app --reload")
    print(f"   2. Visitar: http://localhost:8000/docs")
    print(f"   3. Ejecutar los endpoints con los ejemplos anteriores")
    print("\n")
