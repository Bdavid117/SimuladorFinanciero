# Validación de Fórmulas Financieras

Simulador de Portafolio de Inversiones

## Ejemplo 1: Valoración de Bonos (Precio Sucio)

### Parámetros del Bono

```text
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

$$Precio = \sum_{t=1}^{n} \frac{Cupón}{(1+TIR)^t} + \frac{Nominal}{(1+TIR)^n} + Cupón\ Acumulado$$

### Cálculo Paso a Paso

1. **Cupón por periodo**:

   ```text
   Cupón = (1,000,000 × 0.0725) / 2 = $36,250
   ```

1. **TIR por periodo**:

   ```text
   TIR_periodo = 0.085 / 2 = 0.0425 (4.25% semestral)
   ```

1. **Periodos restantes**:

   ```text
   Años restantes = 2030-01-01 - 2026-02-06 ≈ 3.9 años
   Periodos = 3.9 × 2 = 7.8 ≈ 8 periodos semestrales
   ```

1. **Valor Presente de Cupones**:

   ```text
   VP_cupones = 36,250/(1.0425)^1 + 36,250/(1.0425)^2 + ... + 36,250/(1.0425)^8

   VP_cupones = 36,250 × [1 - (1.0425)^-8] / 0.0425
   VP_cupones = 36,250 × 6.6816
   VP_cupones ≈ $242,209
   ```

1. **Valor Presente del Nominal**:

   ```text
   VP_nominal = 1,000,000 / (1.0425)^8
   VP_nominal = 1,000,000 / 1.3962
   VP_nominal ≈ $716,211
   ```

1. **Precio Limpio**:

   ```text
   Precio Limpio = 242,209 + 716,211 = $958,420
   ```

1. **Cupón Acumulado (Interés Devengado)**:

   ```text
   Días transcurridos = 36 (desde último cupón)
   Cupón acumulado = 36,250 × (36 / 180) ≈ $7,250
   ```

1. **Precio Sucio (Total a Pagar)**:

   ```text
   Precio Sucio = 958,420 + 7,250 = $965,670
   ```

   Pequeñas variaciones pueden ocurrir debido a la convención de días exacta usada.

---

## Ejemplo 2: Liquidación de CDTs (con Penalización)

### Datos del CDT

```text
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

### Cálculo del CDT

$$I = P \times \left((1+i)^{\frac{n}{365}} - 1\right)$$

1. **Interés Bruto**:

   ```text
   I = 10,000,000 × ((1 + 0.125)^(75/365) - 1)
   Exponent = 75/365 ≈ 0.2055
   Base = 1.125
   Factor = 1.125^0.2055 ≈ 1.0246
   I = 10,000,000 × (1.0246 - 1)
   I = 10,000,000 × 0.0246 = $246,000
   ```

1. **Cálculo de Penalización**:

   - Días transcurridos (75) > 60, por tanto aplica 20%

   ```text
   Penalización = 246,000 × 0.20 = $49,200
   ```

1. **Interés Neto**:

   ```text
   Neto = 246,000 - 49,200 = $196,800
   ```

1. **Total a Recibir**:

   ```text
   Total = 10,000,000 + 196,800 = $10,196,800
   ```

---

## Ejemplo 3: Conversión de Divisas

### Datos de Conversión (AAPL)

```text
Cantidad de Acciones: 100
Precio Unitario:      $150.25 USD
TRM (Tasa de Cambio): $4,800 COP/USD
Comisión Bróker:      $50,000 COP
```

### Fórmula

$$Costo = (Cantidad \times Precio_{USD} \times TRM) + Comisión$$

### Cálculo de Conversión

1. **Costo en Dólares**:

   ```text
   Costo USD = 100 × 150.25 = $15,025 USD
   ```

1. **Conversión a Pesos**:

   ```text
   Costo COP Base = 15,025 × 4,800 = $72,120,000 COP
   ```

1. **Costo Total con Comisión**:

   ```text
   Total = 72,120,000 + 50,000 = $72,170,000 COP
   ```

---

## Ejemplo 4: Sistema de Calificación

### Datos de Calificación

```text
Meta Administrador:   15% E.A. (0.15)
Rendimiento Real:     18% E.A. (0.18)
```

### Fórmula de Calificación

$$Nota = \left( \frac{Rendimiento\ Real}{Meta\ Admin} \right) \times 5.0$$

Nota máxima limitada a 5.0

### Cálculo de Calificación

1. **Relación de Cumplimiento**:

   ```text
   Cumplimiento = 0.18 / 0.15 = 1.2 (120%)
   ```

1. **Nota Numérica**:

   ```text
   Nota = 1.2 × 5.0 = 6.0
   Como 6.0 > 5.0, entonces Nota = 5.0
   ```

1. **Escala Cualitativa**:

   - 4.5 - 5.0: **Excelente** (Seleccionada)
   - 4.0 - 4.4: **Sobresaliente**
   - 3.5 - 3.9: **Bueno**
   - 3.0 - 3.4: **Aceptable**
   - Menor a 3.0: **Insuficiente**
