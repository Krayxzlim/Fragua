# Implementación local, 20/11/2026

Base: PR #1 de Krayxzlim/Fragua, rama prototype/esp32-ollama-dice-reader. Copia local independiente; no modifica main ni publica cambios.

Plan: revisar flujo existente → fijar contrato → implementar → verificar con dobles y Ollama real → diferir ensayos físicos.

Flujo existente: app.js administra imagen y lectura en RAM; camera.js obtiene /capture; auto.js compara miniaturas y espera retiro; ollama.js valida la respuesta del modelo. index.js conecta dependencias.

Alternativas: (A) reemplazar por el servidor antiguo basado en ráfagas y disco; (B) continuar este prototipo con una entrada de archivo. Elegida B: respeta el firmware CameraWebServer y la decisión de no guardar video, permite ensayos sin cámara y mantiene una sola función de reconocimiento.

Contrato: POST /api/read-image con cuerpo image/jpeg o image/png, máximo 4 MiB, decodificación real y reducción antes de inferencia. Misma salida que /api/read. Una operación de cámara/inferencia/calibración a la vez; estado y frontend siguen accesibles. Solo loopback. Imágenes en RAM; registro persistente y conexión a partidas FRAGUA pendientes.

Perfil Ollama: fragua-d20 derivado de gemma3:4b, temperatura 0, contexto 4096, salida 256 tokens. Adaptación mediante instrucciones, NO entrenamiento de pesos. Valores d20 1..20 y cara superior visible; las lecturas son candidatos no confirmados. La confianza textual del modelo no es una medida de precisión.
