# Fragua — Instrucciones para Codex

## Alcance y forma de trabajo

Fragua es un ecosistema para preparar y jugar campañas de rol con una web para el DM y una aplicación Android para jugadores. Mantén los tres repositorios y sus responsabilidades. Comunícate en español.

Este archivo orienta el trabajo; no autoriza por sí solo cambios, despliegues ni acciones externas. Si el usuario pide análisis o documentación, entrega eso sin modificar código. Cuando solicita implementación, trabaja dentro del alcance autorizado. Pide aclaración solo si una decisión pendiente bloquea el cambio o afecta datos, permisos o reglas del producto.

Antes de modificar, inspecciona el código relevante, las instrucciones locales, los contratos y las pruebas. Conserva los cambios del usuario. No reemplaces una funcionalidad existente por una reimplementación sin comprobar primero cómo funciona.

## Repositorios y responsabilidades

- `Krayxzlim/dnd-campaign-hub-frontend`: React, Vite y JavaScript. Interfaz web de campañas, misiones y encuentros; planificación y gestión del DM. Consume la API REST compartida.
- `Krayxzlim/dnd-campaign-hub-backend`: Node.js, Express y Prisma sobre PostgreSQL en Supabase. API compartida, autorización, validación, persistencia y reglas de dominio. Es el propietario de las migraciones del esquema de juego.
- `Krayxzlim/DNDcompanion`: Android nativo con Java. Login, consulta y gestión del personaje, misiones y ayudas de juego. Consume la misma API REST.

Supabase Auth proporciona identidad. El backend determina qué puede hacer esa identidad sobre cada campaña y recurso. No confundas autenticación con autorización.

Mantén las tecnologías existentes. No migres JavaScript a TypeScript, Java a Kotlin/Compose ni conviertas los repositorios en un monorepo como parte de una tarea incidental.

## Estado de partida: verificar antes de dar por hecho

La siguiente base proviene del contexto del usuario y de documentación previa. No es una auditoría actual ni acredita que las pruebas pasen hoy.

- Backend: ya maneja campañas, miembros, misiones, encuentros y personajes, con pruebas de integración. Extiende esos módulos y protege sus contratos.
- Android: ya tiene login, misiones básicas, personajes y dados. La ficha completa, las notas persistentes, el inventario persistente y los XP automáticos siguen pendientes según el contexto recibido.
- Frontend: ya tiene campañas, misiones y encuentros. No presupongas que incluye el planificador narrativo completo ni todos los flujos descritos abajo.
- La ficha derivada, el motor compartido completo, la caché Room, los comandos versionados y los nuevos endpoints del documento móvil son propuestas, salvo evidencia posterior en código y pruebas.

Un campo `rewardXp` no demuestra que se acrediten XP. Una pantalla no demuestra persistencia. Un endpoint no demuestra autorización correcta. Una prueba presente no equivale a una prueba ejecutada.

Cuando informes estado, distingue: existente inspeccionado, verificado mediante ejecución, parcial, pendiente y propuesto. Indica el repositorio, la revisión o los archivos que sustentan las afirmaciones importantes.

## Funcionamiento esperado del producto

Los siguientes puntos describen el objetivo funcional. No declaran que esté implementado.

### Campañas y planificación del DM

- Manejar campañas, miembros y roles DM/jugador por campaña. No supongas un único rol global por usuario.
- Permitir al DM organizar arcos, capítulos, secciones y ubicaciones conectadas como nodos. Revisar el modelo existente antes de definir entidades y relaciones nuevas.
- Separar contenido preparado, contenido revelado y secretos del DM. El jugador solo recibe información autorizada; ocultarla visualmente no es suficiente.
- Permitir encuentros aleatorios dentro de opciones o tablas seleccionadas por el DM. Generar una propuesta no la activa, no completa una misión y no concede recompensas automáticamente.
- Preservar referencias entre planificación, ubicaciones, encuentros y misiones. Acordar cardinalidades, reglas de conexión y eliminación antes de migrar datos.

### Misiones entre web y Android

- El DM crea y asigna misiones desde la web; el jugador las consulta, acepta y sigue desde Android.
- Verificar primero si la asignación vigente corresponde a usuario, personaje, grupo o campaña. No cambiar su significado silenciosamente.
- Definir transiciones válidas y quién puede aceptar, actualizar, completar y confirmar una misión según los contratos existentes y la política acordada.
- Persistir los cambios en la API y mostrar el mismo estado al volver a consultar desde ambos clientes.
- No prometer actualización instantánea si solo existe consulta bajo demanda. Agregar notificaciones o Realtime únicamente cuando la tarea lo requiera.

### Personajes, XP y progresión

- Identificar siempre al personaje por ID, con propietario y campaña cuando corresponda. Una cuenta puede tener varios personajes.
- Separar configuración del personaje, valores derivados y estado de juego. No guardar valores provisionales como reglas definitivas.
- Implementar XP y progresión de clase/nivel con validación del servidor, trazabilidad y prevención de recompensas duplicadas.
- Antes de acreditar XP, definir el personaje beneficiario, el origen de la recompensa y la autoridad que confirma su entrega.
- Alcanzar un umbral puede requerir elecciones de clase, hechizos, rasgos o PV. No completar la subida de nivel inventando esas elecciones.
- La elección entre XP, hitos o ambos configurables sigue pendiente en la documentación. No presentarla como acordada.

## Documentación y dirección móvil

Consulta `Fragua-requisitos-movil-2024.html` antes de trabajar en ficha, reglas o interfaz móvil. En el espejo del proyecto está en `sources/Fragua-requisitos-movil-2024.html`; puede estar adjunto o ubicado en otra carpeta en un checkout real. `/mnt/data/Fragua-requisitos-movil-2024.html` es una ruta del entorno original, no una ruta de Windows que deba codificarse.

La copia consultada se identifica como versión 0.5 del 26 de septiembre de 2026. Sus observaciones de código son históricas y puntuales. Sus rutas propuestas, modelos, nombres de componentes y pruebas de aceptación no constituyen implementación. Si no está disponible, informa la limitación sin inventar su contenido.

Decisiones confirmadas en ese documento:

- Cobertura de todas las clases y reglas aplicables del SRD 2024 dentro de las funciones definidas; no limitar el producto al personaje usado como ejemplo.
- Modo asistente de mesa: explicar reglas y registrar recursos, manteniendo el arbitraje contextual del DM. No exigir combate sincronizado estricto.
- Offline únicamente para consultar el último estado descargado. No crear una cola de escrituras offline.

Dirección de implementación propuesta, a contrastar con el repositorio:

- Mantener Java y Views. Separar UI, estado de pantalla, acceso a datos y reglas; migrar gradualmente hacia ViewModel y repositorios tipados cuando corresponda.
- Room es una propuesta para caché de lectura, no una dependencia que se deba asumir instalada.
- Abrir la ficha del personaje activo al tocar su nombre. Derivar salvaciones, habilidades, acciones, hechizos, recursos y descansos de sus datos y fuentes.
- Mantener la estética de fantasía oscura y oro, con controles accesibles, texto escalable y alternativas de lista para selectores circulares.
- No copiar números de mockups como constantes de CA, PV, XP, ataques o CD. Sustituir valores ficticios mediante reglas verificadas.
- Modelar notas persistentes e inventario como funciones distintas. Una nota que menciona un objeto no agrega equipo al personaje.
- Para notas, la propuesta es privacidad por propietario, texto y dibujo versionados, recuperación de borradores y conflictos visibles. Vincular una nota a campaña no implica compartirla con el DM.
- Distinguir mascota narrativa, familiar, compañero y criatura convocada. Sus capacidades proceden de una fuente válida; no se conceden por el nombre de una clase.

Offline: mostrar fecha de última actualización y datos desactualizados. Bloquear cambios de PV, gastos, descansos, aceptación de misiones, edición de notas, inventario y otras escrituras. Al reconectar, verificar sesión y refrescar antes de habilitar comandos. Aislar caché por cuenta y personaje; limpiar datos privados al cerrar sesión explícitamente.

Si se pierde conexión durante una escritura ya enviada, el resultado puede ser incierto. Conservar el identificador de operación y reconciliarlo antes de repetir. Recuperar un borrador previo no habilita edición offline ni permite mostrarlo como guardado.

Siguen pendientes políticas detalladas sobre descansos, correcciones del DM, dados físicos/digitales y contenido fuera del SRD. Resolverlas cuando afecten la tarea, sin reabrir las tres decisiones confirmadas.

## Reglas SRD, catálogo y licencias

- Usar SRD 5.2.1 como referencia de las reglas revisadas de 2024. Verificar cada regla y excepción contra la fuente correspondiente antes de implementarla.
- Open5e es proveedor de contenido, no un motor de reglas. Comprobar versión de API, filtros, paginación y respuestas reales antes de cambiar su integración.
- No asumir que un identificador como `srd-2024` garantiza una revisión concreta sin comprobar sus metadatos.
- No mezclar contenido de 2014, 2024 y terceros por coincidencia de nombres. Conservar identificadores estables, fuente, versión, idioma, licencia y atribución.
- Separar texto descriptivo y efectos ejecutables. No interpretar descripciones con búsquedas de palabras para decidir reglas.
- Mantener una matriz de cobertura que diferencie contenido disponible, solo consulta, reglas implementadas y reglas probadas. Marcar resolución manual donde falte automatización.
- El SRD no incluye todo el material comercial. Antes de incorporar o redistribuir contenido, comprobar su licencia y cumplir atribución y condiciones aplicables. No importar manuales, imágenes, traducciones ni otros materiales sin derechos adecuados.
- Mantener avisos de licencia y créditos existentes. Registrar fuente y cambios de contenido sin presentar material propio como oficial.
- Versionar reglas y contenido por separado; una actualización del catálogo no debe modificar silenciosamente personajes existentes.

## Backend, contratos y consistencia

- Mantener la autoridad de permisos, recompensas y mutaciones en el backend. Los clientes presentan datos y solicitan operaciones; no deciden saldos definitivos.
- Separar cálculo puro de reglas, servicios de aplicación, transporte HTTP y persistencia. Evitar fórmulas independientes en React y Android.
- Validar entradas y salidas con las convenciones existentes. Definir contratos explícitos para nuevos endpoints sin exponer indiscriminadamente modelos Prisma.
- Documentar contratos compartidos, preferentemente con OpenAPI si se adopta en el proyecto. No afirmar que ese documento ya existe.
- Para nuevos comandos con recursos o recompensas, diseñar transacciones, idempotencia y control de versión. Un reintento no debe duplicar XP, objetos, gasto de espacios o descansos.
- Un mismo identificador de comando con otra intención debe rechazarse. Un conflicto concurrente exige reconciliar el estado, no sobrescribirlo sin aviso.
- Conservar personajes existentes en migraciones aditivas. Marcar datos incompletos y pedir elecciones faltantes en el producto; no inventarlas durante la migración.
- No introducir llamadas a proveedores externos dentro de una transacción de estado de juego.

## Seguridad y privacidad

- Validar la sesión mediante el mecanismo verificado del backend. Obtener al actor de la identidad autenticada, nunca de un `userId` enviado por el cliente.
- Comprobar propiedad, membresía, rol y visibilidad en cada lectura y escritura, incluidos resultados de comandos y archivos privados.
- Probar accesos entre cuentas y campañas. El rol DM no concede acceso global ni acceso automático a notas privadas.
- No confiar en que RLS proteja automáticamente una conexión Prisma privilegiada. Revisar políticas, grants y controles del servidor conforme a la vía de acceso real.
- No incluir claves `service_role`, contraseñas de PostgreSQL, tokens, secretos JWT ni credenciales de firma Android en código, builds, logs, capturas, tarjetas o documentación.
- Usar variables de entorno y ejemplos sin valores reales. Todo lo incluido en el bundle Vite o APK puede extraerse; no guardar allí secretos.
- No imprimir archivos de credenciales para diagnosticar. Redactar valores sensibles y usar identificadores de correlación en lugar de tokens.
- No conectar clientes directamente a tablas de juego para eludir la API. Revisar almacenamiento seguro de sesión y limpieza de caché al cambiar de cuenta.
- Probar migraciones y acciones destructivas en una base de ensayo. No resetear, truncar ni migrar producción sin autorización específica y un plan de recuperación.

## Cambios entre repositorios

1. Identifica el repositorio activo y los consumidores afectados. Comprueba las instrucciones de cada repositorio antes de tocarlo.
2. Revisa el contrato vigente: rutas, payloads, estados, errores, autenticación e identificadores. No inventes rutas basándote en propuestas del documento móvil.
3. Define el cambio mínimo y su compatibilidad. Si otro repositorio es necesario pero no está disponible o autorizado, documenta la dependencia y solicita el acceso o alcance faltante.
4. Implementa primero un backend compatible, después los clientes que lo consumen. Mantén contratos anteriores hasta migrar sus consumidores.
5. Usa fixtures o ejemplos comunes para comprobar que web y Android interpretan igual los datos. Prueba al menos un flujo completo cuando la tarea cruce repositorios.
6. Mantén commits y PR separados por repositorio si se solicitan. Enlaza dependencias y explica el orden de integración, despliegue y recuperación.
7. Informa qué repositorios cambiaron y cuáles requieren trabajo posterior. No declares completado el flujo si solo está implementado en una capa.

## Flujo de trabajo de Codex en Windows

1. Confirma carpeta de trabajo, rama y cambios locales. Lee los `AGENTS.md` aplicables, README y documentación específica de la función.
2. Inspecciona archivos relevantes, scripts, lockfiles, configuración Gradle, esquema Prisma, migraciones y pruebas existentes según la tarea.
3. Explica brevemente el problema, el cambio previsto y cómo comprobarlo. Reutiliza convenciones y dependencias; evita refactorizaciones ajenas al objetivo.
4. Implementa en pasos revisables dentro del alcance pedido. No borres ni reviertas trabajo ajeno y no hagas force push, despliegues o operaciones destructivas por iniciativa propia.
5. Ejecuta verificaciones pertinentes y revisa el diff final, incluyendo contratos, secretos, migraciones y documentación.
6. Entrega un resumen con cambios, pruebas ejecutadas y resultados, limitaciones y pendientes. No confundir compilación con verificación funcional.

Usa comandos compatibles con PowerShell y el directorio correcto. Determina el gestor Node por el lockfile y los scripts reales; no asumas que existen `test`, `lint` o `build`. En Android usa el wrapper `gradlew.bat` del proyecto y verifica sus tareas, JDK y SDK. No documentes comandos como comprobados si no se ejecutaron.

Si faltan credenciales, SDK, servicios o conexión, realiza las comprobaciones independientes disponibles y explica qué quedó sin verificar. No simules resultados. Los archivos sincronizados bajo `sources/`, cuando existan, son referencias de solo lectura.

## Calidad y pruebas

Conserva la suite de integración existente del backend. Ejecuta pruebas adecuadas al cambio y añade casos que prueben comportamiento, especialmente para errores corregidos y nuevas reglas.

- Backend: autenticación, propiedad, membresía, roles, validación, transiciones de misiones, aislamiento de campañas y compatibilidad de contratos.
- Recompensas y recursos: doble solicitud, concurrencia, rollback, saldo insuficiente, versiones conflictivas y un único movimiento por recompensa.
- Reglas: modificadores negativos con redondeo hacia abajo, límites de nivel, competencias, fuentes de magia, equipo, condiciones, descansos y excepciones pertinentes.
- Frontend: carga, vacío, error, sesión vencida, permisos y resultados después de mutar/refrescar. Verificar los flujos existentes afectados.
- Android: login/renovación/logout, navegación por ID, cambio de personaje/cuenta, rotación o recreación, persistencia real, modo avión y reconexión.
- Persistencia móvil: reabrir la app debe conservar datos confirmados; un timeout no debe duplicar operaciones ni mostrar éxito falso.
- Ecosistema: cuando corresponda, crear/asignar una misión en web, aceptarla y seguirla en Android, verificar en API y volver a consultar desde web.

No usar producción para pruebas destructivas. No ocultar fallos previos ni omitir pruebas silenciosamente. Registrar qué se ejecutó, qué pasó y qué no se pudo ejecutar.

## Trello y criterio de finalización

Referencia de trabajo: [Trello Fragua](https://trello.com/b/rVVlceel/fragua).

Consulta las tarjetas pertinentes cuando tengas acceso. Una tarjeta expresa trabajo o intención; el código y las pruebas sustentan el estado implementado. Si no puedes acceder, informa la limitación y no inventes tarjetas, listas, IDs ni estados.

No modificar Trello salvo que la tarea lo autorice. No mover una tarjeta a `Done` basándote solo en nombres de archivos, una pantalla o una respuesta anterior.

Para declarar finalizado un cambio, verifica sus criterios de aceptación, persistencia y permisos, las pruebas pertinentes y los consumidores afectados. Si queda integración, migración, compilación o validación necesaria sin comprobar, informa el estado parcial y la evidencia faltante. Registra la evidencia en Trello cuando esté autorizado actualizarlo.

## Instalación y mantenimiento de estas instrucciones

Este archivo es una base común para los tres repositorios. Mantén una copia en la raíz de cada repositorio que abras de manera independiente en Codex. Si ya existe un `AGENTS.md`, integra las instrucciones sin sobrescribir reglas locales útiles.

Puedes conservar además una copia maestra en la carpeta padre `Fragua`. No dependas exclusivamente de ella: el descubrimiento de instrucciones del proyecto normalmente comienza en la raíz Git y llega al directorio de trabajo; una carpeta padre externa puede quedar fuera.

Mantén sincronizadas las reglas comunes y añade detalles específicos dentro del repositorio correspondiente. Las copias deben ser autosuficientes para checkouts y worktrees que no tengan la carpeta padre. No uses enlaces simbólicos como requisito de instalación en Windows.

Después de instalar o cambiar el archivo, inicia un chat nuevo en la carpeta correcta y pide a Codex que indique las instrucciones cargadas. Comprueba también si existe un `AGENTS.override.md` que sustituya al archivo de esa carpeta.

Guía oficial de descubrimiento: https://learn.chatgpt.com/docs/agent-configuration/agents-md
