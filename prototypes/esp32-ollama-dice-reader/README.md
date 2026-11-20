# Lector local de d20 para FRAGUA

Prototipo independiente en esta carpeta. Adaptado del prototipo del chat «Optimizar respuesta web cámara», rama prototype/esp32-ollama-dice-reader de Krayxzlim/Fragua. No modifica ni publica el backend de FRAGUA.

## Usarlo ahora, sin cámara

1. Abrir Ollama y mantenerlo funcionando.
2. Ejecutar INICIAR.cmd (si la aplicación ya está abierta, no iniciar otra copia).
3. Abrir http://127.0.0.1:3000.
4. Elegir una imagen JPEG o PNG y pulsar «Analizar archivo».

El archivo se procesa localmente. La API conserva únicamente la última imagen y resultado en memoria hasta reemplazarlos o cerrar el proceso. No graba video ni registra tiradas en FRAGUA. Una respuesta reconocida es un candidato que requiere revisión humana; la confianza declarada por el modelo no es una probabilidad calibrada.

## Modelo configurado

Ollama ejecuta fragua-d20, un perfil de gemma3:4b con visión, instrucciones para la cara superior del d20 y salida JSON. Temperatura 0, contexto 4096 y máximo 256 tokens de respuesta. El filtro admite valores enteros 1–20 solo para d20, con cara superior visible y confianza media o alta; los demás resultados devuelven valor null.

Esto configura un modelo previamente entrenado: NO entrena sus pesos con tus dados. Aún no hay un conjunto de fotos etiquetadas del montaje ni una medición de precisión. Un modelo de visión puede confundir una cara lateral, 6/9 u otros números incluso cuando indica confianza alta.

Para reproducir la instalación en una PC con Node.js 20 o posterior y Ollama:

```powershell
npm ci
ollama pull gemma3:4b
node setup-model.js
Copy-Item .env.example .env
npm start
```

La instalación actual ya tiene dependencias, modelo y .env. No hace falta repetir estos pasos. Si ollama no se reconoce como comando en esta PC, su ejecutable está en %LOCALAPPDATA%\Programs\Ollama\ollama.exe.

## API

- GET /api/health: disponibilidad de la API y nombre de modelo; no prueba la conexión con Ollama.
- GET /api/state: última lectura, revisión y estado automático.
- POST /api/read-image: cuerpo binario image/jpeg o image/png, hasta 4 MiB y 16 millones de píxeles. Decodifica y reduce a un máximo de 1024 por lado antes del análisis.
- GET /api/last-image: última imagen en memoria.
- GET /api/capture: fotografía de la ESP32-CAM.
- POST /api/read: captura y analiza una foto de la cámara.
- POST /api/auto/calibrate: toma referencia de bandeja vacía.
- POST /api/auto/start y /api/auto/stop: control automático.

Ejemplo desde PowerShell con una foto propia:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/api/read-image -Method Post -ContentType image/jpeg -InFile C:\ruta\d20.jpg
```

Respuesta: estado, dado, valor (entero o null), cara_superior_visible, confianza, observacion, confirmed:false, timestamp, revision e imageUrl. El campo estado reconocido no equivale a una tirada confirmada. Una futura integración debe revisar/confirmar el candidato y prevenir duplicados antes de registrar la tirada.

Errores: 409 operación ocupada, 413 cuerpo excesivo, 415 tipo no permitido, 422 imagen inválida, 502 fallo de cámara o modelo. La API escucha en 127.0.0.1 y rechaza orígenes externos; no está preparada para publicarse en Internet.

## Cuando conectemos la ESP32-CAM

1. Verificar su IP y actualizar CAMERA_URL en .env si cambió. Actualmente figura http://192.168.1.95/capture.
2. Reiniciar la API si se cambió .env.
3. Fijar la cámara sobre una bandeja, con buena iluminación y cara superior legible.
4. Probar captura manual y comparar la foto con el dado real.
5. Calibrar con la bandeja vacía e iniciar automático manteniéndola vacía al comienzo.
6. Tirar un d20 y esperar a que se estabilice. Retirarlo antes de una nueva tirada.

El modo automático compara fotografías pequeñas para detectar cambios y estabilidad; no es un detector de dados entrenado. Objetos o cambios de luz pueden activarlo. Solo la imagen estable se envía al modelo. Los umbrales y tiempos son valores iniciales pendientes de calibrar. No se consulta continuamente al LLM ni se almacena una filmación.

## Evidencia y pendientes

Verificado el 20/11/2026:

- 10 pruebas automatizadas aprobadas: validación de respuesta, imagen, concurrencia, errores y contratos de API, entre otras. La mayoría usan sustitutos de cámara/modelo.
- Prueba real API → Ollama con una imagen gris sintética sin dados: HTTP 200, valor null, aproximadamente 8,7 segundos. Evidencia: smoke-result.json. No mide precisión de d20 ni latencia de cámara.
- Interfaz local accesible con el perfil fragua-d20.

Reproducir pruebas: npm test. Repetir la prueba local real: node smoke-local.js (reemplaza la última imagen en memoria y smoke-result.json).

Pendiente: capturas físicas, exactitud por cara, abstenciones, falsos positivos, rendimiento sostenido, calibración de estabilidad y prueba con GTX1070 en la escena real. También quedan pendientes integración con FRAGUA, registro persistente y actuador del parcial.

Antes de decidir un ajuste fino, reunir imágenes etiquetadas de las 20 caras, distintas orientaciones, iluminación, ausencia de dado y casos borrosos. Separar sesiones completas entre entrenamiento y evaluación para evitar evaluar con fotos casi idénticas a las de entrenamiento. Medir aciertos, errores y abstenciones en el conjunto reservado. No reportar entrenamiento ni precisión hasta disponer de esa evidencia.

## Material del parcial

El informe HTML y la primera implementación están en ../iot-material-inicial, identificados como históricos. El usuario informó que las imágenes probadas funcionan bien; no hay todavía un registro etiquetado para calcular precisión. Los pesos de Ollama no se incluyen en Git: se reproducen con setup-model.js y la descarga del modelo base.
