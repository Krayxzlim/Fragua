# Ampliación: d20 con visión local

## Configuración inicial para el equipo de Luciano

Equipo declarado: 16 GB RAM DDR4 2666 MHz y NVIDIA GTX 1070 de 8 GB. Primera opción para evaluar: `qwen2.5vl:3b-q4_K_M` (modelo de visión, descarga de unos 3,2 GB). El tamaño descargado no equivale a la memoria total en ejecución. La API limita contexto a 4096 y salida a 128 tokens. No hay tiempos ni precisión medidos en este equipo.

Instalar Ollama desde https://ollama.com/download/windows y ejecutar:

```powershell
ollama pull qwen2.5vl:3b-q4_K_M
```

Después, configurar API_TOKEN como explica GUIA.md y ejecutar `backend/start-local-d20.ps1`. Durante una inferencia, usar `ollama ps` para comprobar si usa GPU o CPU. La aceleración de la GTX 1070 depende del controlador y de la compatibilidad de la versión instalada; no se da por comprobada por tener 8 GB. Si se usa CPU, medir latencia antes de decidir un cambio de versión o motor. No modificar controladores automáticamente.

La descarga inicial requiere Internet; las solicitudes del adaptador se envían solo al servicio local. No se detectó el comando Ollama en PATH durante la preparación, y no se descargó el modelo.

La API ahora admite `POST /v1/rolls/<device>/<roll>/analyze-d20`, con la misma autorización Bearer. Ejecutarlo después de recibir los tres fotogramas y antes de confirmar. Sustituye el candidato d6 y establece sides=20. Luego revisar fotos, confirmar y obtener el evento como en GUIA.md.

Requiere Ollama y un modelo de visión descargado localmente. Configurar `$env:OLLAMA_MODEL = 'NOMBRE_DEL_MODELO_LOCAL'` antes de iniciar la API. No se instaló ni descargó un modelo todavía: falta conocer RAM y GPU del PC para elegir su tamaño. No usar variantes cloud. Ollama debe escuchar en 127.0.0.1:11434; no exponerlo a la red.

Ejemplo, usando las variables de GUIA.md:

```powershell
Invoke-RestMethod -Method Post -Uri "$rollUrl/analyze-d20" -Headers $headers
```

La inferencia puede demorar hasta 120 segundos. Durante ese tiempo este servidor de laboratorio devuelve 503 a otras solicitudes: no lanzar otra tirada hasta terminar. Se ejecuta por separado para no exceder el timeout de la ESP32. Fallos dejan candidato nulo y fotos conservadas. La confirmación humana sigue siendo obligatoria.

Estado: adaptador implementado, sin inferencia real ni precisión física medidas. El HTML y ZIP previos describen la versión d6; este documento describe la ampliación local aún por validar. Un modelo general ya entrenado no equivale a un modelo especializado entrenado con tus dados.

Contrato oficial: https://docs.ollama.com/capabilities/vision y https://docs.ollama.com/api/chat
