# SPIKE · Protocolo del huevo (BLE) y efectos de luz

Documento para quien programa el firmware. El código completo del hardware está en `firmware/spike_egg/` y el de la app en `src/egg/`.

## 1. Hardware

| Pieza | Detalle |
| --- | --- |
| Placa | ESP32 DevKit de 30 pines, Bluetooth LE |
| Anillo | 12 LEDs RGB NeoPixel WS2812, datos en **GPIO18** |
| Botón ● amarillo | **GPIO25** (a GND, `INPUT_PULLUP`) |
| Botón ▲ azul | **GPIO26** |
| Botón ■ morado | **GPIO27** |
| Botón « ? » blanco | **GPIO13** |
| Sonido / vibración | Ninguno |
| Brillo máximo del anillo | **100 de 255** (`strip.setBrightness(100)`) |
| Destellos | Como mucho **3 por segundo**. Ninguna luz gira alrededor del anillo |

## 2. Bluetooth LE

Servicio UART de Nordic (NUS). Nombre anunciado: `SPIKE-Huevo`.

| Dirección | Característica | UUID |
| --- | --- | --- |
| Servicio | Nordic UART | `6E400001-B5A3-F393-E0A9-E50E24DCCA9E` |
| App → caja | RX (escritura) | `6E400002-B5A3-F393-E0A9-E50E24DCCA9E` |
| Caja → app | TX (notificación) | `6E400003-B5A3-F393-E0A9-E50E24DCCA9E` |

Los mensajes son **texto terminado en salto de línea** (`\n`). Cada mensaje cabe en un paquete de 20 bytes.

### Caja → app

| Mensaje | Significado |
| --- | --- |
| `B:1` | Botón ● amarillo |
| `B:2` | Botón ▲ azul |
| `B:3` | Botón ■ morado |
| `B:Q` | Botón « ? » (no entendí) |
| `HB` | Latido: se envía cada 2 s mientras haya una app conectada |

### App → caja

| Mensaje | Significado |
| --- | --- |
| `H:<0-12>` | LEDs de calor encendidos. Ejemplo `H:5`. El calor solo sube dentro de un módulo; vuelve a 0 al empezar otro |
| `C:<RRGGBB>` | Color base del módulo en hexadecimal sin `#`. Ejemplo `C:FF8001` |
| `FX:<NOMBRE>` | Reproduce un efecto de la tabla de abajo. Ejemplo `FX:OK` |

Reglas:

- La app envía **como máximo 10 mensajes por segundo** (cola). Si hay varios `H:` o `C:` seguidos, solo se manda el último.
- El orden se respeta: para un acierto la app manda `FX:OK` **antes** de `H:<n+1>`. Al recibir un `FX:` la caja guarda el calor actual; los LEDs que se enciendan después son los «nuevos».
- Si pasan más de 6 s sin recibir `HB`, la app considera perdido el enlace y reintenta con esperas de 1, 2, 4, 8 y 10 s.
- La caja reacciona sola al botón (destello `PRESS`) sin esperar a la app.
- Sin app conectada la caja reproduce `WAIT`.

## 3. Efectos

Se **superponen al calor** y, al terminar, el anillo vuelve al calor. Están definidos una sola vez, como datos, en `src/egg/effects.json`. El simulador (`VirtualEgg`) y el firmware (`firmware/spike_egg/effects.h`, generado con `node tools/gen-firmware.mjs`) leen esa misma definición.

Colores de rol y módulo: niño `#FF8001` · padre `#45C1FF` · Modo maestro `#E7B3FF` · dorado `#FFD34D` · azul claro `#9FD8FF` · cálido `#FFB46B`.

| Efecto | Cuándo | Qué hace | Duración |
| --- | --- | --- | --- |
| `WAIT` | Sin conexión | Respiración lenta en azul claro (`#9FD8FF`), sin calor | Bucle de 5 s |
| `CONNECT` | Al conectar | El calor aparece con un fundido cálido | 1,8 s |
| `PRESS` | Al pulsar un botón | Destello corto de todos los LEDs al 30 % | 0,22 s |
| `TURN_N` | Empieza el turno del niño | Dos pulsos suaves naranja | 1,9 s |
| `TURN_P` | Empieza el turno del padre | Dos pulsos suaves azules | 1,9 s |
| `OK` | Acierto | Los LEDs nuevos se encienden de uno en uno en naranja cálido, con un destello dorado | 1,8 s |
| `CASI` | «¡Casi!» | Respiración lenta azul claro sobre el calor actual. El calor no baja y no hay rojo | 3,2 s |
| `TEACH` | Durante el Modo maestro | Pulso lila lento | Bucle de 4 s |
| `LEARNED` | Fin del Modo maestro | Doble pulso: lila y luego dorado | 2,1 s |
| `LEVELUP` | Pasar de nivel | Llena los 12 LEDs con el color del módulo (`C:`), 3 pulsos grandes, chispas suaves al azar y reinicia | 5,6 s |
| `HATCH` | Eclosión | Latido que se acelera, destello blanco, chispas multicolor lentas y calor cálido fijo (se queda hasta recibir otra orden) | 8,2 s |
| `FINAL` | Al terminar todo | Chispas con los colores de los 5 módulos | Bucle de 6 s |

### Cómo se compone cada fotograma

1. Base: los primeros `H` LEDs en su color de calor (naranja rojizo → naranja → amarillo).
2. Encima, las capas del efecto en curso (`breathe`, `pulse`, `fade`, `heatGain`, `seq`, `sparkle`, `hold`), mezcladas con transparencia.
3. Salida al anillo, siempre con el brillo máximo en 100/255.

Las chispas usan una secuencia pseudoaleatoria fija (`hash` en `render.ts` y `hashN` en el `.ino`), así que simulador y hardware dibujan lo mismo. Frecuencia máxima de chispas: 3 por segundo.

## 4. Cambiar entre simulador y caja real

En `src/egg/index.ts`:

```ts
export const EGG_MODE = 'virtual' as 'virtual' | 'ble'   // 'ble' usa Web Bluetooth real
```

El resto de la app solo usa la interfaz `EggDevice`: `connect()`, `disconnect()`, `setHeat(0–12)`, `setColor(hex)`, `play(efecto)`, `onButton(cb)` y `onConnectionChange(cb)`. Web Bluetooth funciona en Chrome o Edge sobre `https` o `localhost`; la conexión debe iniciarla un toque del usuario (botón «Conectar huevo»).

## 5. Compilar el firmware

1. Arduino IDE con el paquete de placas **esp32**; placa «ESP32 Dev Module».
2. Librería **Adafruit NeoPixel**.
3. Abrir `firmware/spike_egg/spike_egg.ino` y subirlo.
4. Si se cambia `src/egg/effects.json`, ejecutar `node tools/gen-firmware.mjs` para regenerar `effects.h`.
