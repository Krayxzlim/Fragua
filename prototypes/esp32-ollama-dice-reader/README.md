# Lector de dados IoT · ESP32-CAM + Ollama

Prototipo **independiente de Fragua**, implementado en Node.js y Express. La cámara ESP32-CAM entrega fotografías JPEG y el servidor las envía al modelo de visión gemma3:4b instalado en Ollama local. El resultado aparece en una página web sencilla, sin Supabase ni autenticación.

## Requisitos

- Node.js 20 o superior.
- ESP32-CAM conectada a la misma red que la computadora, con GET /capture disponible (ejemplo: http://192.168.1.95/capture).
- Ollama local y gemma3:4b descargado (ollama list).
- Buena iluminación, un dado visible y fondo uniforme.

## Ejecutar en Windows (PowerShell)

1. Clonar la rama: git clone -b prototype/esp32-ollama-dice-reader https://github.com/Krayxzlim/Fragua.git
2. Entrar al proyecto: cd Fragua\prototypes\esp32-ollama-dice-reader
3. Copiar configuración: Copy-Item .env.example .env
4. Instalar dependencias: npm install
5. Iniciar: npm start
6. Abrir http://localhost:3000

Verificar primero la cámara:

    curl.exe -f --max-time 15 http://192.168.1.95/capture -o dado.jpg

Verificar Ollama:

    curl.exe http://localhost:11434/api/tags

Si /capture no devuelve un JPEG, consultar qué ruta ofrece el firmware y modificar CAMERA_URL en .env. Ollama debe mostrar gemma3:4b con capacidad vision.

## Uso manual

1. Elegir **Ver foto** para comprobar el encuadre.
2. Colocar un único dado quieto y pulsar **Analizar dado**.
3. Esperar la respuesta del modelo. La primera consulta puede ser más lenta porque carga el modelo en memoria.
4. La pantalla muestra la fotografía, tipo de dado, número u opción indeterminada, observación y confianza cualitativa.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | /api/health | Verifica que Express está activo |
| GET | /api/capture | Solicita una foto JPEG a la cámara |
| POST | /api/read | Captura y consulta Ollama; devuelve JSON |
| GET | /api/state | Última lectura y estado del detector |
| GET | /api/last-image | Última fotografía recibida |
| POST | /api/auto/calibrate | Referencia visual de mesa vacía |
| POST | /api/auto/start | Inicia monitoreo experimental |
| POST | /api/auto/stop | Detiene monitoreo |

Respuesta ilustrativa de POST /api/read:

    {
      "estado": "reconocido",
      "dado": "d20",
      "valor": 17,
      "cara_superior_visible": true,
      "confianza": "alta",
      "observacion": "Número visible en la cara superior",
      "timestamp": "2026-11-19T12:00:00.000Z",
      "revision": 2,
      "imageUrl": "/api/last-image?v=2"
    }

Cuando la cara superior no es clara o el resultado no es válido, valor es null. La confianza declarada por un modelo generativo no constituye una probabilidad calibrada y la interpretación de dados reales puede fallar.

## Modo automático experimental

El procesamiento de movimiento se realiza en Node.js. Se compara una miniatura de las capturas con una referencia de mesa vacía y con el fotograma anterior. El servidor espera estabilidad antes de llamar **una vez** a Ollama. Después espera retirar el objeto para evitar duplicados.

1. Retirar el dado y cualquier objeto de la zona.
2. Pulsar **Calibrar mesa vacía**.
3. Pulsar **Iniciar**.
4. Lanzar un dado y esperar que se detenga.
5. Retirar el dado para rearmar el sistema.

**Limitación:** el detector observa cambios visuales, no comprueba que el objeto sea un dado. Manos, sombras y alteraciones de iluminación pueden activar lecturas. Ajustar AUTO_OCCUPANCY_THRESHOLD, AUTO_EMPTY_THRESHOLD, AUTO_MOTION_THRESHOLD, AUTO_STABLE_MS y AUTO_INTERVAL_MS en .env según el entorno.

## Pruebas

Ejecutar npm test. La suite usa simulaciones de cámara y Ollama y revisa validación de resultados, respuestas HTTP y conflictos de lectura. Esto **no verifica el hardware real ni la precisión del modelo**.

## Seguridad y alcance

El servidor escucha en 127.0.0.1 de forma predeterminada. No publicar Ollama ni las rutas de la cámara en Internet. No tiene autenticación, persistencia de resultados, ni integración con Fragua. Se mantiene en una rama y una carpeta aisladas para no alterar la app existente.
