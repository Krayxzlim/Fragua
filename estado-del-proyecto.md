# Fragua: estado consolidado y próximos pasos

Revisión del 26 de octubre de 2026. Fuente: código de las ramas consolidadas, pruebas ejecutadas y `requerimientos.md`. Este documento actualiza el estado histórico descrito en documentos anteriores; no supone un despliegue en producción.

## Organización

| Repositorio | Responsabilidad | Rama original preservada | Desarrollo |
| --- | --- | --- | --- |
| DNDcompanion | Aplicación Android Java/Views para jugadores | master | testing |
| dnd-campaign-hub-backend | API Express, reglas y Prisma/PostgreSQL | main | testing |
| dnd-campaign-hub-frontend | Web React/Vite para gestión del DM | main | testing |
| Fragua | Requisitos, instrucciones y estado del proyecto | main | testing |

No se convirtió el sistema en un monorepo. Se conserva Supabase Auth como identidad y la API compartida como autoridad de permisos y estado de juego. Cada repositorio tiene su propia rama testing; deben probarse con versiones compatibles.

## Qué comprende hoy

| Área | Implementación inspeccionada | Límite actual |
| --- | --- | --- |
| Acceso | Registro, sesión y recuperación de contraseña en web/Android | El envío real de correo y las URLs autorizadas dependen de la configuración de Supabase; no se enviaron correos en esta revisión |
| Gestión del DM | Campañas, participantes, misiones/asignaciones y encuentros; consulta de monstruos | No hay planificador narrativo completo por arcos, capítulos y nodos |
| Creador Android | Pasos de especie, clase, atributos, trasfondo, equipo/dote, habilidades, pericia de pícaro y revisión; borrador retenido | Creación versionada de nivel 1; las elecciones de especie y muchos rasgos de clase siguen siendo guías |
| Atributos | Arreglo estándar, compra de 27 puntos, 4d6 descartando el menor, recomendaciones opcionales y desglose base/trasfondo | Modo manual sujeto a políticas del DM pendiente; las tiradas del cliente no se certifican ante el DM |
| Trasfondos | Acólito, Criminal, Sabio y Soldado SRD; aumentos, habilidades, herramientas, paquete o monedas | No incluye todo el Manual del Jugador ni sustituye habilidades duplicadas entre fuentes |
| Dotes | Alerta, Atacante salvaje e Iniciado en la magia con decisiones y recursos | El contexto de combate y los efectos sobre objetivos se resuelven en la mesa |
| Clase inicial | Habilidades de las doce clases, salvaciones, PV base por dado y Constitución; pericia del pícaro | Faltan equipo/armas/armaduras, decisiones de conjuros de clase y otros rasgos; PV extra de especie u otras fuentes no automatizados |
| Ficha y juego | Habilidades, salvaciones, CA, iniciativa, ataques, PV, dados, inventario, monedas, espacios, concentración, descansos, compañeros y rasgos consultables | Automatización parcial de reglas, condiciones y excepciones; completar ficha no certifica todas las reglas |
| Notas | Secciones, texto y dibujo persistentes, revisiones y conflictos | Faltan herramientas avanzadas y recuperación completa del borrador tras muerte del proceso |
| Persistencia | Comandos con idempotencia y versión; permisos por propietario/campaña; decisiones de creación separadas del gasto de recursos | Historial técnico no equivale a historial semántico de progresión |
| Sin conexión | Caché Room de lectura por cuenta en Android | No hay escrituras offline ni sincronización de mutaciones pendientes sin confirmación |
| Web de personaje | API disponible y gestión del DM | No existe aún el creador/ficha de jugador equivalente a Android |

Los catálogos de texto y las subclases consultables no implican efectos ejecutables. La configuración manual de niveles/multiclase anterior tampoco equivale a un asistente de progresión legal.

## Relación con los requisitos

- RF-01/02/05/06: selectores contextuales, filas de atributos y recomendaciones implementados; variantes de especie pendientes.
- RF-03/04/07: trasfondos SRD y métodos oficiales implementados dentro del alcance descrito; faltan políticas de modo manual, otras fuentes y correcciones de decisiones.
- RF-08: identidad básica existente; avatar/descripción ampliada pendientes.
- RF-09: reconstrucción de personajes de nivel superior pendiente.
- RF-10/11/12: cobertura parcial; habilidades, pericia y base de clase avanzaron, pero faltan elecciones y automatización exhaustiva de rasgos/conjuros.
- RF-13 a RF-18: progresión guiada, preview, XP/hitos, autorización del DM e historial semántico pendientes. No se debe acreditar XP por el solo hecho de mostrar una recompensa en una misión.
- RF-19/20/21: API compartida y persistencia implementadas para los flujos existentes; integración web de personaje y aceptación completa extremo a extremo pendientes.

## Orden recomendado de desarrollo

1. **Estabilizar testing en uso real.** Ejecutar Android + web + API contra una base de ensayo: crear personaje, cerrar/reabrir, gastar recursos, reconectar, asignar/aceptar misión y verificar aislamiento entre cuentas. Probar recuperación de contraseña y accesibilidad en dispositivo. Criterio: recorrido reproducible, sin duplicación ni pérdida de datos.
2. **Completar un recorrido de creación de nivel 1.** Empezar por el mago: trucos, libro, preparación, equipo de clase y competencias; después decisiones de especie. Cada decisión debe tener catálogo, validación, persistencia, efecto y prueba. Extender luego a las otras clases con estado de cobertura explícito.
3. **Completar las especies y fuentes faltantes.** Ascendencias/linajes, sentidos, resistencias, velocidad, aumentos de PV y concesiones de magia; resolver duplicaciones y mantener procedencia.
4. **Construir la progresión.** Registro de decisiones por nivel, preview puro, elecciones obligatorias y confirmación atómica/idempotente; definir XP/hitos y autoridad del DM antes de acreditar recompensas. La creación a nivel superior debe reutilizar ese mismo recorrido.
5. **Llevar ficha y creador a web.** Consumir los mismos contratos, sin duplicar el motor de reglas. Después ampliar planificación narrativa y notificaciones según prioridades de producto.

La siguiente entrega recomendada es la validación de testing en un entorno de ensayo y luego las elecciones de magia inicial del mago. Evitar agregar nuevas reglas antes de tener comprobado el recorrido común.

## Rama y conservación del historial

`testing` es la rama de desarrollo habitual. `master`/`main` conserva exactamente su punta previa y no recibe las mejoras de esta consolidación. Las ramas anteriores están incluidas por ascendencia y archivadas en etiquetas `archive/2026-10-26/...`; el inventario exacto y hashes están en `docs/branch-consolidation.md` de cada repositorio.

Se resolvió la divergencia de recuperación de contraseña de Android conservando la implementación ya integrada y el historial de ambas ramas. No se hizo squash ni force push. El frontend incluye su rama de recuperación de contraseña. Las comprobaciones CI de los tres repositorios de código se ejecutan ahora en testing.

El nombre testing no crea por sí mismo un servidor ni una base de pruebas. No se cambió la rama predeterminada de GitHub, no se desplegó y no se modificaron bases remotas.

## Evidencia de esta consolidación

- Android: `assembleDebug`, `testDebugUnitTest` y `lintDebug` correctos localmente; 38 pruebas sin fallos. CI de testing también aprobado: https://github.com/Krayxzlim/DNDcompanion/actions/runs/40338721916
- API: ocho archivos de pruebas de reglas correctos localmente; suite completa de integración y validación Prisma aprobadas en CI: https://github.com/Krayxzlim/dnd-campaign-hub-backend/actions/runs/40338723464
- Web: build, lint y cuatro pruebas de recuperación correctos localmente y en CI: https://github.com/Krayxzlim/dnd-campaign-hub-frontend/actions/runs/40338731059
- No se ejecutaron recorridos con dispositivo físico, correo real ni servicios de producción. Las pruebas de integración usan una base de ensayo dentro de CI.

## Estado de las ramas anteriores

El frontend queda con `main` y `testing`; su rama de recuperación y la referencia local work se retiraron después de verificar respaldo e inclusión. En Android y backend se conservan las ramas anteriores además de testing y las etiquetas: la revisión automática bloqueó el borrado masivo del backend por requerir autorización explícita de eliminación. No se intentó el mismo borrado masivo en Android. Esto no deja código fuera de testing; solo quedan referencias históricas adicionales hasta confirmar su eliminación.
