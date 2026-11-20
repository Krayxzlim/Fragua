# FRAGUA · laboratorio físico de lectura de dados

Estado: software de laboratorio preparado; montaje, fotos y mediciones físicas pendientes. El diseño supone **ESP32-CAM AI Thinker con OV3660 y PSRAM**. Las fotos de la conversación anterior no están disponibles aquí: confirmar la serigrafía y la base antes de conectar. Una base USB-C puede ser programador o solo alimentación; el conector no lo demuestra.

## 1. Materiales y montaje seguro

Ya comprados, según tu declaración: kit ESP32-CAM con OV3660 3 MP y base programadora USB-C (ARS 29.990), HC-SR501 (ARS 3.900), lote de 40 Dupont hembra-hembra de 20 cm (ARS 3.800) y lote de 40 macho-macho de 20 cm (ARS 4.500). Total comprado: ARS 42.190. Aprovechamos el LED blanco integrado de GPIO4 como **actuador luminoso**: convierte una orden en luz y señala el disparo durante 80 ms. La cámara y el PIR son sensores. La aceptación del LED integrado como actuador debe confirmarse con el docente, sin afirmar que ya fue aprobada.

Necesarios para operar: cable USB **de datos**, alimentación USB estable de 5 V (fuente con capacidad de al menos 1 A), PC, Wi-Fi 2,4 GHz, un dado d6 blanco de puntos negros, superficie oscura mate y soporte firme para la cámara. No comprar nada más antes de revisar lo que tenés. Si la base tapa los pines, hacen falta extensores/apiladores o una placa de acceso compatible; no dejar cables sueltos presionados entre conectores.

1. Desenchufar USB y cualquier otra fuente. Trabajar sobre superficie no conductora; no conectar/desconectar Dupont con energía.
2. Verificar modelo AI Thinker, posición de la cámara y orientación de la base. Alinear todas las hileras sin desplazar un pin. No confiar en una foto genérica para decidir izquierda/derecha.
3. Leer las etiquetas del PIR: **VCC → 5V ESP32-CAM (rojo)**; **GND → GND (negro)**; **OUT → GPIO13 (amarillo)**. El orden físico varía entre placas: seguir etiquetas, no colores del módulo. Usar hembra-hembra si ambos extremos son pines macho.
4. No conectar OUT a 5 V. El HC-SR501 nominalmente entrega lógica de 3,3 V; si el módulo difiere, verificar su ficha o medir antes de conectarlo. Los GPIO ESP32 no admiten señales de 5 V. No alimentar por el pin 3V3 con 5 V.
5. Dejar la ranura microSD vacía: GPIO13 y GPIO4 comparten funciones con SD. No usar GPIO12 para el PIR. GPIO0 queda libre en funcionamiento normal.
6. Alimentar únicamente por la base USB-C durante estas pruebas. No inyectar simultáneamente otra fuente en 5V. La base es una interfaz, no necesariamente una fuente regulada independiente.
7. Empezar con PIR en modo L/no repetible, tiempo de retención mínimo y sensibilidad moderada, verificando las marcas reales. No forzar los potenciómetros. El firmware espera 60 s de estabilización y luego exige observar LOW antes del primer disparo.
8. Ubicar la cámara perpendicular a la bandeja, a una distancia inicial orientativa de 15–25 cm, ajustando hasta que la cara superior se vea enfocada y ocupe una parte grande del encuadre. Iluminar de forma difusa y constante. Mantener manos fuera del cuadro al capturar. No mirar el LED de cerca.

Si hay reinicios/brownout: desconectar, revisar cable/fuente/contactos y probar sin PIR; **no desactivar el detector de brownout**. Si cámara_init falla, revisar modelo y flex con alimentación desconectada. Si PIR queda HIGH, revisar retardo/jumper y retirar personas del campo: no equivale a dado inmóvil.

## 2. Levantar la API

En PowerShell, dentro de `backend`, con Node.js 22 o posterior:

```powershell
npm ci
$env:API_TOKEN = [guid]::NewGuid().ToString('N')
$env:HOST = '0.0.0.0'
npm start
```

Guardar el token de esa terminal de forma privada y poner el mismo en `secrets.h`; no incluirlo en capturas del informe. Para verlo localmente si hace falta: `$env:API_TOKEN`. La API por defecto escucha solo en localhost; `HOST` permite que la ESP32 la alcance. Usar `ipconfig` para obtener la IPv4 del PC y ponerla en API_URL. Ambos dispositivos deben estar en la misma red, sin aislamiento de clientes. Permitir TCP 8787 únicamente en red privada si Windows lo solicita. No abrir puertos en el router. HTTP transmite token y fotos sin cifrar: esta versión es para LAN de laboratorio confiable; un despliegue real requiere HTTPS, CA validada en ESP32 y credenciales por dispositivo.

Comprobar `http://localhost:8787/health`. El backend guarda JPEG y JSON en `backend/data/<device>/<roll>/`. No hay cuota automática: revisar espacio y archivar/borrar ensayos viejos manualmente. No está preparado para Internet ni múltiples procesos. Si recibe solicitudes simultáneas devuelve 503; el firmware no reintenta esa captura. Un roll incompleto sigue pendiente.

## 3. Compilar y cargar

Ruta recomendada: abrir `firmware` con PlatformIO; configuración fijada a espressif32 6.9.0 / Arduino ESP32 2.0.17. Copiar `include/secrets.example.h` a `include/secrets.h`, completar Wi-Fi, contraseña, IP y token. Ejecutar:

```text
pio run
pio run -t upload
pio device monitor
```

También se puede usar Arduino IDE con paquete **esp32 by Espressif Systems 2.0.17**, placa **AI Thinker ESP32-CAM**: crear carpeta `FraguaCam`, crear un `FraguaCam.ino` vacío (o con un comentario), copiar `src/main.cpp` conservando el nombre `main.cpp` y los encabezados de `include` a esa carpeta. No instalar otra biblioteca de cámara: viene con el paquete.

Conectar USB y seleccionar el puerto de la base. Si no aparece puerto, comprobar cable de datos, driver del chip USB de la base y si realmente incluye conversor USB-serie. Algunas bases entran en carga automáticamente. Si la tuya requiere modo manual, seguir su botón BOOT/IO0; con placa identificada y alimentación quitada se puede unir GPIO0 a GND para arrancar el cargador, cargar, quitar el puente con USB desconectado y reiniciar. No dejar GPIO0 a masa para ejecutar. No usar adaptadores serie con señales de 5 V.

Monitor 115200 baudios. Tras 60 s y LOW, pasar la mano: LED 80 ms → espera 2,5 s → tres JPEG. Entre fotos hay al menos 700 ms **más** el tiempo de envío HTTP; no es una ráfaga de frecuencia fija. Luego espera 5 s y LOW para rearmar. Escribir `c` permite prueba manual cuando está listo. La espera se ajusta en SETTLE_MS. El PIR detecta cambios infrarrojos del gesto, no el movimiento del dado; la comparación visual posterior tampoco garantiza reposo entre fotos.

Si no hay red, la cámara captura y descarta las imágenes con mensaje explícito: no existe almacenamiento offline ni reenvío. Para probar primero captura sin PIR, usar `c`. Un fallo de cámara al inicio bloquea la operación hasta reinicio.

## 4. Reconocimiento y contrato FRAGUA

MVP: **un solo d6 blanco con puntos negros**, cara superior casi cuadrada y centrada, bandeja oscura, sin otras regiones blancas grandes. La API reduce a 320×240, segmenta una cara blanca, cuenta regiones oscuras compatibles con puntos y compara los dos últimos fotogramas. Si coinciden y la diferencia media es menor a 3 niveles de gris, propone `candidate_value`. Este umbral es inicial, sin calibración física; no es una probabilidad ni una precisión medida. Una forma ajena a un dado puede producir candidato: por eso toda ráfaga completa requiere revisión humana.

Un d4/d8/d10/d12/d20, números impresos, varios dados, dados oscuros o transparentes están **fuera de soporte**. Para ampliarlo, sustituir `recognize` por un modelo entrenado/servicio de visión, indicar tipo de dado, definir lectura del d4 y obtener un conjunto real etiquetado separado de entrenamiento. No se promete que un LLM básico sea exacto. No se envían imágenes a terceros en esta versión.

`POST /v1/captures`: cuerpo JPEG crudo, `Content-Type: image/jpeg`, `Authorization: Bearer <token>`, `X-Device-Id`, `X-Roll-Id` y `X-Frame-Index: 0|1|2`. Límite 1 MiB y 4 megapíxeles al decodificar. La misma clave y bytes es idempotente; otros bytes con la misma clave dan 409. El identificador de tirada incorpora nonce de arranque y secuencia; no es un timestamp.

`GET /v1/rolls/<device>/<roll>` devuelve estado y candidatos. `GET /v1/rolls/<device>/<roll>/2.jpg` permite revisar la última foto autenticándose. Se pueden consultar igualmente 0.jpg y 1.jpg. No basta con abrir esa URL en el navegador sin autorización.

Ejemplo PowerShell (reemplazar roll por el que imprime la ESP32):

```powershell
$headers = @{ Authorization = "Bearer $env:API_TOKEN" }
$rollUrl = 'http://localhost:8787/v1/rolls/fragua-cam-01/REEMPLAZAR_ROLL'
Invoke-RestMethod -Uri $rollUrl -Headers $headers
Invoke-WebRequest -Uri "$rollUrl/2.jpg" -Headers $headers -OutFile 'resultado.jpg'
# Solo después de ver la foto y verificar el valor:
Invoke-RestMethod -Method Post -Uri "$rollUrl/confirm" -Headers $headers -ContentType 'application/json' -Body '{"value":5,"reviewer":"Luciano"}'
Invoke-RestMethod -Uri "$rollUrl/event" -Headers $headers
```

FRAGUA podrá consumir el evento `dice.roll.confirmed` con `event_id`, `device_id`, `roll_id`, `sides`, `value`, `confirmed_at` y `provenance`. Debe deduplicar por `event_id` y asociar una partida en su propio backend. **No se implementó integración real con FRAGUA** porque no se proporcionó su repositorio/contrato/autenticación. No se hace webhook ni se modifica ninguna partida. Confirmar requiere la misma clave de laboratorio; en producción separar permisos de dispositivo y operador.

## 5. Evidencia real y defensa

Abrir `informe.html` con doble clic. Incluye exactamente las doce secciones obligatorias y anexos de montaje/defensa. La portada identifica a Luciano Aufieri y la fecha de elaboración del 11/11/2026. Los costos comprados ya están cargados. Completar calendario, costos auxiliares y resultados reales. Los campos se guardan en ese navegador cuando permite almacenamiento local; exportar JSON como copia segura, y usar Imprimir para PDF. Adjuntar fotos mediante el selector y exportar evidencias JSON; no dar por entregados datos que solo están en el navegador. Para entregar el HTML ya completado usar **Descargar informe completo**.

Guardar originales en `evidencias/` con ID, fecha y ensayo: E01 frente/reverso de placas; E02 conexiones con USB desconectado; E03 montaje completo; E04 JPEG real y cara conocida; E05 log serial y respuesta API; E06 video desde lanzamiento hasta revisión y LED visible. Evitar credenciales, rostros y datos privados.

Hacer mínimo propuesto de 30 tiradas (5 por cada valor d6, sin afirmar que son aleatorias), 10 gestos sin dado, 10 tiradas consecutivas, una prueba sin Wi-Fi y otra con API detenida. Registrar verdad de referencia **antes de corregir el candidato**, latencia desde gesto a recepción, foto, valor automático o rechazo, confirmación y ajuste. Separar conjunto de calibración y evaluación. Medir tasa de captura, cobertura de candidatos y exactitud entre candidatos; no contar correcciones humanas como aciertos automáticos. Informar n y limitaciones. La plantilla de dos fallos simulados pertenece a modalidad simulada; en físico documentamos fallos reales de red y respuesta, sin fingir una simulación ni desconectar cables energizados.

Defensa sugerida: problema → bloques y conexiones → gesto y LED → JPEG/API → candidato y confirmación → evidencia de errores → límites/mejoras. Cada integrante participa. Comunicar modalidad física en el archivo de grupos del docente. La ponderación de la consigna: proyecto 2, informe 3, funcionamiento 4, defensa 1.

## Fuentes técnicas verificadas

- Pines AI Thinker: https://github.com/espressif/arduino-esp32/blob/2.0.17/libraries/ESP32/examples/Camera/CameraWebServer/camera_pins.h
- Cámara/JPEG/PSRAM: https://github.com/espressif/esp32-camera
- Placa PlatformIO: https://docs.platformio.org/en/latest/boards/espressif32/esp32cam.html
- HC-SR501: https://www.addicore.com/products/pir-infrared-motion-sensor-hc-sr501
- Procesamiento: https://sharp.pixelplumbing.com/api-resize/
- Consigna: conversación “Mejora proyecto físico”, recuperada completa en este trabajo. No se modificó ningún archivo de sources.
