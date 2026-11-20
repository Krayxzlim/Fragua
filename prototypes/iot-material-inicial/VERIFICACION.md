# Verificación del paquete

Fecha de elaboración: 11/11/2026, zona America/Buenos_Aires.

## Backend: comprobado

Entorno: Node.js 22.17.1, sharp 0.34.5. Dependencias resueltas en package-lock.json.
Comando: `npm test` en `backend`.
Resultado: **9 pruebas aprobadas, 0 fallidas**.

- Seis pruebas: reconocimiento de las caras 1 a 6 de imágenes JPEG sintéticas.
- Una prueba: rechazo de una cara blanca vacía.
- Una prueba de contrato HTTP: autenticación, índice inválido, JPEG inválido, captura, repetición idempotente, conflicto de contenido, bloqueo de evento sin confirmación, revisión, validación y repetición de confirmación, evento y descarga exacta de JPEG.
- Una prueba: dos últimos fotogramas distintos no producen candidato.

Estas imágenes fueron generadas en memoria. **No son fotos del hardware ni miden precisión real**. Los archivos de prueba se eliminaron al finalizar; no se mezclaron con evidencias físicas.

## Firmware

**Compilación aprobada con PlatformIO Core 6.1.18**: `pio run`, placa `esp32cam`, plataforma `espressif32@6.9.0`, framework `3.20017.241212+sha.dcc1105b` (Arduino ESP32 2.0.17), toolchain Xtensa 8.4.0+2021r2-patch5. Se generaron firmware.elf y firmware.bin con credenciales de ejemplo.

Resultado del compilador: SUCCESS, 30,67 s. RAM estática: 50.464/327.680 bytes (15,4 %). Programa: 874.197/3.145.728 bytes (27,8 %). Esto no mide memoria dinámica máxima ni PSRAM durante captura.

La compilación se realizó sobre una copia idéntica en una ruta temporal corta para evitar límites de rutas de Windows. Arduino CLI falló por acceso al directorio de paquetes; PlatformIO permitió completar la verificación. En Windows, si aparece `CreateProcess: No such file or directory`, ubicar el proyecto y las herramientas en rutas más cortas.

No se conectó, programó ni probó una placa física. No cargar el binario de prueba con credenciales de ejemplo: completar secrets.h y volver a compilar.
La configuración objetivo es AI Thinker ESP32-CAM, framework Arduino ESP32 2.0.17 y plataforma Espressif32 6.9.0. El kit declarado por el usuario incluye OV3660; el mapa de pines físico sigue por verificar.

## Informe HTML

Comprobado: doce secciones obligatorias y sintaxis JavaScript válida. Código fuente incluido y datos de nombre/costos incorporados.
La política del navegador bloqueó la apertura de archivos locales con `file://`. **No se realizó inspección visual ni prueba interactiva en navegador**. No se presenta esa comprobación como aprobada. Abrir informe.html localmente y revisar navegación, modo presentación, importación/exportación, fotos e impresión antes de entregar.

## Pendiente de validación física

Identificación de placa y base, cableado, alimentación, carga del firmware, PIR, LED real, JPEG reales, enfoque, latencia, precisión, cobertura, fallos de red y video demostrativo. No hay resultados físicos inventados. La integración con una instancia real de FRAGUA no está conectada.

Los importes de ARS 42.190 son datos de compra declarados por el usuario, no estimaciones técnicas. Faltan comprobantes y costos auxiliares. El informe permanece abierto hasta completar las pruebas reales.
