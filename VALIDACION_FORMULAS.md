# VALIDACIÓN DE FÓRMULAS FINANCIERAS
# Simulador de Portafolio de Inversiones

## EJEMPLO 1: VALORACIÓN DE BONOS (PRECIO SUCIO)

### Parámetros del Bono
```
Valor Nominal:        $1,000,000 COP
Tasa Cupón:           7.25% anual
Frecuencia:           2 pagos al año (semestral)
Cupón Semestral:      $36,250 COP
TIR Deseada:          8.5% anual
Fecha Emisión:        2024-01-01
Fecha Vencimiento:    2030-01-01
Fecha Valoración:     2026-02-06
```

### Fórmula Implementada

$$Precio = \sum_{t=1}^{n} \frac{Cupón}{(1+TIR)^t} + \frac{Nominal}{(1+TIR)^n} + Cupón \ Acumulado$$

### Cálculo Paso a Paso

1. **Cupón por periodo**:
   ```
   Cupón = (1,000,000 × 0.0725) / 2 = $36,250
   ```

2. **TIR por periodo**:
   ```
   TIR_periodo = 0.085 / 2 = 0.0425 (4.25% semestral)
   ```

3. **Periodos restantes**:
   ```
   Años restantes = 2030-01-01 - 2026-02-06 ≈ 3.9 años
   Periodos = 3.9 × 2 = 7.8 ≈ 8 periodos semestrales
   ```

4. **Valor Presente de Cupones**:
   ```
   VP_cupones = 36,250/(1.0425)^1 + 36,250/(1.0425)^2 + ... + 36,250/(1.0425)^8
   
   VP_cupones = 36,250 × [1 - (1.0425)^-8] / 0.0425
   VP_cupones = 36,250 × 6.6816
   VP_cupones ≈ $242,209
   ```

5. **Valor Presente del Nominal**:
   ```
   VP_nominal = 1,000,000 / (1.0425)^8
   VP_nominal = 1,000,000 / 1.3962
   VP_nominal ≈ $716,211
   ```

6. **Precio Limpio**:
   ```
   Precio Limpio = 242,209 + 716,211 = $958,420
   ```

7. **Cupón Acumulado (Interés Devengado)**:
   ```
   Días transcurridos = 36 (desde último cupón)
   Cupón acumulado = 36,250 × (36 / 180) ≈ $7,250
   ```

8. **Precio Sucio (Total a Pagar)**:
   ```
   Precio Sucio = 958,420 + 7,250 = $965,670
   ```
   
   *(Nota: Pequeñas variaciones pueden ocurrir debido a la convención de días exacta usada)*

---

## EJEMPLO 2: LIQUIDACIÓN DE CDTs (CON PENALIZACIÓN)

### Parámetros del CDT
```
Capital Invertido:    $10,000,000 COP
Tasa Efectiva Anual:  12.5%
Plazo Original:       90 días
Días Transcurridos:   75 días
Fecha Inicio:         2025-11-23
Fecha Liquidación:    2026-02-06
```

### Reglas de Penalización
- Si días ≤ 60: Penalización del 10% sobre intereses brutos
- Si días > 60: Penalización del 20% sobre intereses brutos

### Cálculo Paso a Paso

1. **Interés Bruto (Compuesto)**:
   $$I = P \times \left((1+i)^{\frac{n}{365}} - 1\right)$$
   
   ```
   I = 10,000,000 × ((1 + 0.125)^(75/365) - 1)
   Exponent = 75/365 ≈ 0.2055
   Base = 1.125
   Factor = 1.125^0.2055 ≈ 1.0246
   I = 10,000,000 × (1.0246 - 1)
   I = 10,000,000 × 0.0246 = $246,000
   ```

2. **Cálculo de Penalización**:
   - Días transcurridos (75) > 60, por tanto aplica 20%
   ```
   Penalización = 246,000 × 0.20 = $49,200
   ```

3. **Interés Neto**:
   ```
   Neto = 246,000 - 49,200 = $196,800
   ```
   
4. **Total a Recibir**:
   ```
   Total = 10,000,000 + 196,800 = $10,196,800
   ```

---

## EJEMPLO 3: CONVERSIÓN DE DIVISAS

### Parámetros
```
Activo:               100 acciones Apple (AAPL)
Precio Unitario:      $150.25 USD
TRM (Tasa de Cambio): $4,800 COP/USD
Comisión Bróker:      $50,000 COP
```

### Fórmula
$$Costo = (Cantidad \times Precio_{USD} \times TRM) + Comisión$$

### Cálculo Paso a Paso

1. **Costo en Dólares**:
   ```
   Costo USD = 100 × 150.25 = $15,025 USD
   ```

2. **Conversión a Pesos**:
   ```
   Costo COP Base = 15,025 × 4,800 = $72,120,000 COP
   ```

3. **Costo Total con Comisión**:
   ```
   Total = 72,120,000 + 50,000 = $72,170,000 COP
   ```

---

## EJEMPLO 4: SISTEMA DE CALIFICACIÓN

### Parámetros
```
Meta del Administrador:  15% E.A. (0.15)
Rendimiento Real Portafolio: 18% E.A. (0.18)
```

### Fórmula de Calificación
$$Nota = \left( \frac{Rendimiento \ Real}{Meta \ Admin} \right) \times 5.0$$

*Nota máxima limitada a 5.0*

### Cálculo Paso a Paso

1. **Relación de Cumplimiento**:
   ```
   Cumplimiento = 0.18 / 0.15 = 1.2 (120%)
   ```

2. **Nota Numérica**:
   ```
   Nota = 1.2 × 5.0 = 6.0
   Como 6.0 > 5.0, entonces Nota = 5.0
   ```

3. **Escala Cualitativa**:
   - 4.5 - 5.0: **Excelente** [Seleccionada]
   - 4.0 - 4.4: **Sobresaliente**
   - 3.5 - 3.9: **Bueno**
   - 3.0 - 3.4: **Aceptable**
   - < 3.0: **Insuficiente**

### Resultado
- Nota Final: **5.0**
- Concepto: **Excelente**
