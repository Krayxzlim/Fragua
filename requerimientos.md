# Requerimientos de desarrollo: creador y progresión de personajes

**Proyecto:** D&D Campaign Hub / Fragua  
**Sistema de reglas:** Dungeons & Dragons 5.5e (2024)  
**Objetivo:** Mejorar el asistente de creación de personajes e implementar un sistema completo de progresión de niveles, manteniendo una experiencia visual sencilla, intuitiva y flexible, inspirada en Valdory.

## 1. Objetivo general

Quiero que el usuario pueda crear un personaje de D&D mediante un asistente paso a paso y que, posteriormente, pueda subirlo de nivel sin tener que actualizar manualmente todas sus estadísticas.

El sistema debe:

- Mostrar información contextual sobre cada elección, sin sobrecargar la pantalla.
- Aplicar las reglas de D&D 2024 automáticamente.
- Recomendar opciones según la clase, pero permitir personalizar libremente el personaje.
- Incorporar las habilidades, competencias, rasgos y hechizos correspondientes.
- Recalcular automáticamente las estadísticas cuando cambie un atributo, equipo, característica o nivel.
- Permitir crear personajes directamente en niveles superiores al primero.
- Guardar las decisiones y el historial de progresión del personaje.

## 2. Mejoras en la selección de especie y clase

### RF-01. Selector de especie

Reemplazar la presentación actual de especies por un selector desplegable.

Al elegir una especie, mostrar inmediatamente debajo un panel informativo con:

- Nombre de la especie.
- Descripción breve.
- Tamaño y velocidad.
- Rasgos especiales.
- Resistencias, sentidos y otras capacidades.
- Variantes u opciones seleccionables, cuando corresponda.

Por ejemplo, al seleccionar Dracónido, mostrar sus características y permitir elegir las opciones de ascendencia correspondientes.

No mostrar todas las descripciones simultáneamente. Solamente debe aparecer la información de la especie seleccionada.

### RF-02. Selector de clase

Aplicar el mismo comportamiento a la selección de clase.

Mostrar un desplegable y, después de seleccionar una opción, un panel con:

- Nombre y descripción de la clase.
- Función habitual en una aventura.
- Atributos principales recomendados.
- Dado de golpe.
- Competencias iniciales.
- Capacidades principales.
- Uso de magia, cuando corresponda.
- Breve explicación de su progresión.

No incluir largas descripciones dentro del desplegable.

### RF-03. Trasfondo

Agregar o integrar correctamente la selección de trasfondo.

En D&D 2024, los aumentos iniciales de atributos provienen normalmente del trasfondo, no de la especie.

El sistema debe aplicar:

- Distribución de +2 y +1 entre atributos permitidos, o +1 a tres atributos permitidos.
- Dote de origen correspondiente.
- Competencias en habilidades y herramientas.
- Equipo inicial o alternativas permitidas.

Evitar duplicar las bonificaciones de reglas anteriores.

## 3. Asignación de atributos

### RF-04. Mantener los métodos existentes

Conservar la funcionalidad actual de asignación, ya que resulta útil, pero mejorar su presentación.

Ofrecer los métodos de D&D 2024:

- Arreglo estándar: 15, 14, 13, 12, 10, 8.
- Compra por puntos: presupuesto de 27 puntos.
- Tiradas: 4d6, descartando el dado menor, seis veces.
- Modo manual, cuando el Dungeon Master lo habilite.

### RF-05. Mejorar la interfaz

Actualmente resulta confuso visualizar el atributo y su valor asignado uno debajo del otro.

Colocar el nombre del atributo y su selector de valor en una misma fila.

Ejemplo:

| Atributo     | Valor asignado | Modificador |
| ------------ | -------------- | ----------- |
| Fuerza       | 15             | +2          |
| Destreza     | 14             | +2          |
| Constitución | 13             | +1          |
| Inteligencia | 12             | +1          |
| Sabiduría    | 10             | +0          |
| Carisma      | 8              | −1          |

Los valores son ilustrativos y deben poder modificarse.

En dispositivos móviles, conservar esta relación horizontal mediante filas compactas y adaptables.

El sistema debe señalar de manera visible qué valores ya fueron utilizados y cuáles están disponibles.

### RF-06. Distribución recomendada por clase

Revisar el botón de distribución automática de atributos.

La distribución debe considerar las características principales de la clase elegida.

Ejemplos:

- Mago: priorizar Inteligencia.
- Bárbaro: priorizar Fuerza y Constitución.
- Pícaro: priorizar Destreza.
- Bardo: priorizar Carisma.

Estas distribuciones deben provenir de configuraciones de reglas, no de condiciones dispersas en la interfaz.

**Importante:** la recomendación no debe ser obligatoria. Si el usuario quiere crear un mago con mucha Fuerza o un guerrero que priorice Inteligencia, debe poder hacerlo.

El botón debe indicar que se trata de una recomendación y permitir modificarla posteriormente.

### RF-07. Mostrar el cálculo de atributos

Distinguir visualmente:

1. Valor base asignado.
2. Aumentos provenientes del trasfondo.
3. Mejoras obtenidas por niveles o dotes.
4. Otros modificadores aplicables.
5. Valor final.
6. Modificador calculado.

El sistema debe aplicar las restricciones correspondientes a las reglas seleccionadas y a las excepciones de las características especiales.

La fórmula general del modificador es:

**Modificador = floor((atributo final − 10) / 2)**

Los cálculos deben actualizarse inmediatamente después de cada cambio.

## 4. Personalización y creación del personaje

### RF-08. Información personal

Mantener los campos para:

- Nombre del personaje.
- Alineamiento.
- Nivel inicial.
- Información descriptiva adicional, opcional.
- Imagen o avatar, cuando la funcionalidad esté disponible.

El nivel inicial debe poder seleccionarse entre 1 y 20, respetando las reglas de la campaña.

### RF-09. Creación de personajes de nivel avanzado

Si se elige crear un personaje directamente en nivel 5, 10 o 15, no debe limitarse a cambiar el número del nivel.

El sistema debe reconstruir su progresión desde el nivel 1 hasta el nivel elegido, solicitando todas las decisiones necesarias en los niveles intermedios.

Esto incluye:

- Características de clase.
- Elección de subclase.
- Dotes y aumentos de atributos.
- Incrementos de puntos de golpe.
- Nuevas competencias y capacidades.
- Hechizos y trucos disponibles.
- Mejoras automáticas por nivel.

El usuario debe poder revisar las decisiones anteriores antes de finalizar.

No permitir subir directamente de nivel 1 a 15 sin resolver las decisiones necesarias.

## 5. Selección de habilidades, rasgos y hechizos

### RF-10. Selección individual

Incorporar una pantalla de personalización donde el usuario pueda seleccionar las opciones que realmente le correspondan según su especie, clase, trasfondo y nivel.

Mostrar únicamente opciones válidas.

Esto incluye:

- Competencias seleccionables.
- Estilos de combate.
- Rasgos configurables.
- Dotes.
- Rasgos de subclase.
- Hechizos y trucos.
- Otras elecciones específicas de clase.

Las opciones deben presentarse individualmente, con nombre y descripción contextual, evitando listas excesivamente extensas.

### RF-11. Selección de hechizos

Implementar un selector de hechizos con búsqueda y filtros.

Cada hechizo debe mostrar:

- Nombre.
- Nivel.
- Escuela de magia.
- Tiempo de lanzamiento.
- Alcance.
- Duración.
- Componentes.
- Concentración, si corresponde.
- Descripción y efectos.

El sistema debe verificar qué hechizos puede elegir el personaje según su clase, nivel y características.

Distinguir correctamente hechizos disponibles, conocidos, preparados y otorgados automáticamente, según las reglas de cada clase.

No confundir el nivel del personaje con el nivel de los hechizos.

## 6. Cálculo automático de estadísticas

### RF-12. Motor de cálculo

Implementar un servicio de cálculo centralizado y reutilizable.

Debe calcular automáticamente:

- Modificadores de los seis atributos.
- Bonificador por competencia.
- Puntos de golpe máximos.
- Clase de armadura.
- Iniciativa.
- Velocidad.
- Tiradas de salvación.
- Bonificadores de habilidades.
- Percepción pasiva.
- Bonificadores de ataque.
- Daño correspondiente a cada ataque.
- Cantidad de ataques permitidos según las características aplicables.
- CD de salvación de conjuros.
- Bonificador de ataque de conjuros.
- Espacios de conjuro y otros recursos de clase.

Los cálculos deben considerar tanto los atributos como la clase, nivel, equipo, competencias y características especiales.

No asumir que todas las clases tienen la misma cantidad de ataques, hechizos o recursos.

Los efectos condicionales deben mostrarse como tales, sin incorporarse permanentemente a las estadísticas si requieren activación.

## 7. Sistema de subida de nivel

### RF-13. Nuevo asistente de progresión

Implementar la funcionalidad **Subir de nivel** dentro de la ficha del personaje.

Al ingresar, mostrar:

- Nivel actual.
- Nivel siguiente.
- Experiencia actual.
- Experiencia necesaria, si la campaña utiliza XP.
- Características que se obtendrán.
- Decisiones pendientes.

La subida de nivel debe funcionar como un asistente guiado.

### RF-14. Aplicación de características nuevas

Cuando un personaje suba de nivel, el sistema debe determinar automáticamente qué cambios corresponden según las reglas de su clase.

Debe contemplar:

- Incremento de puntos de golpe.
- Incorporación del dado de golpe.
- Nuevos rasgos de clase y subclase.
- Aumento de competencia cuando corresponda.
- Nuevas opciones de habilidades.
- Dotes o mejoras de atributos cuando correspondan.
- Nuevos hechizos, trucos y espacios de conjuro.
- Recursos nuevos o mejoras de recursos existentes.

No se deben asignar automáticamente opciones que requieren una decisión del jugador.

### RF-15. Experiencia y progresión

Incorporar dos mecanismos configurables por campaña:

**Progresión por experiencia (XP)**

Registrar experiencia acumulada y detectar cuándo el personaje cumple las condiciones para alcanzar el siguiente nivel.

**Progresión por hitos**

Permitir que el Dungeon Master autorice una subida de nivel independientemente de la experiencia acumulada.

En ambos casos, el asistente debe solicitar todas las elecciones correspondientes.

### RF-16. Vista previa

Antes de confirmar la subida de nivel, mostrar un resumen de cambios.

Ejemplo:

**Mago: nivel 4 → nivel 5**

- Bonificador por competencia: +2 → +3.
- Nuevos puntos de golpe según el método elegido.
- Acceso a nuevas capacidades y hechizos permitidos.
- Actualización de las estadísticas que dependan del nivel.
- Posibilidad de revisar las nuevas selecciones.

La subida solo se confirma cuando todas las elecciones obligatorias están completas.

### RF-17. Historial de progresión

Guardar el historial de subida de niveles.

Registrar:

- Nivel anterior y nuevo.
- Clase que recibió el nivel.
- Características incorporadas.
- Dotes elegidas.
- Aumentos de atributos.
- Hechizos seleccionados.
- Puntos de golpe obtenidos.
- Fecha del cambio.

Permitir consultar el historial y corregir una progresión mediante un mecanismo controlado, sin eliminar silenciosamente decisiones anteriores.

## 8. Configuración de campaña y flexibilidad

### RF-18. Reglas del Dungeon Master

Permitir que el Dungeon Master configure:

- Método permitido para asignación de atributos.
- Nivel inicial permitido.
- Progresión por experiencia o hitos.
- Disponibilidad de contenido personalizado.
- Posibilidad de realizar ajustes manuales justificados.
- Habilitación futura de multiclase.

El sistema debe distinguir entre reglas oficiales y contenido personalizado (homebrew).

Por defecto, la progresión oficial estará limitada a los niveles 1 a 20. Los niveles superiores deberán tratarse como reglas personalizadas.

## 9. Integración con la aplicación existente

### RF-19. Arquitectura e integración

Antes de programar, analizar la implementación actual del creador de personajes, las pantallas reales y el modelo de datos.

Trabajar con la arquitectura existente:

- Frontend web React/Vite.
- Aplicación móvil Android.
- Backend Node.js/Express.
- Base de datos PostgreSQL en Supabase.
- Prisma como ORM.
- Supabase Auth para autenticación.

Verificar estas tecnologías contra el código real antes de asumir detalles de implementación.

Centralizar las reglas y los cálculos en el backend o en un módulo de dominio compartido y validado.

La interfaz web y la aplicación Android deben utilizar las mismas reglas y persistir información compatible.

No duplicar reglas de progresión independientes en cada frontend.

Preservar los personajes existentes mediante migraciones compatibles.

### RF-20. Persistencia de datos

Revisar y extender el modelo de datos para contemplar, como mínimo:

- Personajes.
- Especies y rasgos.
- Clases y subclases.
- Trasfondos.
- Atributos y sus fuentes de modificación.
- Características de clase por nivel.
- Dotes y elecciones.
- Hechizos.
- Niveles por clase.
- Historial de progresión.
- Experiencia.
- Estado de puntos de golpe y recursos consumibles.

Los datos deben permitir reconstruir las estadísticas del personaje sin depender de valores calculados manualmente en las pantallas.

Guardar tanto las decisiones permanentes como el estado actual de recursos consumibles, sin confundir ambos conceptos.

### RF-21. Integración real de las pantallas

Modificar las pantallas efectivamente utilizadas por la aplicación.

No crear layouts, componentes o pantallas de demostración que no estén conectados con la navegación real.

Verificar el flujo completo desde la creación del personaje hasta la ficha final y la subida de nivel.

Respetar el diseño visual existente, mejorando principalmente la organización, claridad y usabilidad.

En Android debe mantenerse la posibilidad de consultar personajes sin conexión, utilizando datos previamente sincronizados, sin permitir modificar niveles sin conexión en esta primera implementación.

## 10. Pruebas y criterios de aceptación

La implementación se considerará completa cuando se puedan verificar estos escenarios:

1. Seleccionar una especie muestra solamente su descripción y características.
2. Cambiar de clase actualiza las recomendaciones de atributos sin borrar innecesariamente las decisiones del usuario.
3. La distribución automática prioriza los atributos de la clase, pero permite cambiarlos.
4. El sistema calcula correctamente las bonificaciones de trasfondo.
5. No se aplican incorrectamente aumentos de atributos de especies de D&D 2014.
6. Las opciones de hechizos y características respetan los requisitos de clase y nivel.
7. Crear un personaje directamente a nivel 15 requiere resolver las decisiones de los niveles anteriores.
8. Subir de nivel actualiza las estadísticas y conserva las elecciones previas.
9. Los cambios de Constitución actualizan correctamente los puntos de golpe máximos.
10. Se guardan las progresiones y pueden recuperarse al reiniciar la aplicación.
11. Web y Android muestran los mismos cálculos.
12. No se pueden guardar progresiones incompletas o inválidas.
13. El sistema muestra las modificaciones antes de confirmarlas.
14. Los recursos consumibles no se restauran automáticamente por el mero hecho de consultar o recalcular la ficha.

Agregar pruebas unitarias para las fórmulas y reglas, pruebas de integración para las operaciones de guardado y pruebas funcionales del flujo completo.

## 11. Orden de implementación

Realizar el trabajo por etapas:

**Etapa 1 — Auditoría:** revisar creador actual, navegación, API, base de datos, reglas disponibles y funcionalidades incompletas.

**Etapa 2 — Motor de reglas:** implementar atributos, bonificaciones, cálculos, progresión y validaciones independientes de la interfaz.

**Etapa 3 — Creación de personajes:** mejorar selectores, distribución de atributos, personalización y creación en niveles avanzados.

**Etapa 4 — Subida de nivel:** desarrollar el asistente de progresión, vista previa, confirmación e historial.

**Etapa 5 — Integración:** conectar completamente web y Android al backend y a la persistencia real.

**Etapa 6 — Verificación:** ejecutar pruebas y corregir diferencias entre cálculos, datos persistidos e interfaces.

## 12. Instrucciones para el agente de desarrollo

Antes de modificar código:

1. Inspeccioná el repositorio y explicá brevemente cómo funciona actualmente la creación de personajes.
2. Identificá las funcionalidades ya implementadas, las incompletas y las que faltan.
3. Revisá el esquema de Prisma y los endpoints existentes antes de modificar la base de datos.
4. Proponé cambios que reutilicen los componentes actuales.
5. Implementá primero la lógica y las validaciones, después la interfaz.
6. No reemplaces funcionalidades que ya funcionan sin necesidad.
7. No utilices datos simulados en lugar de la persistencia real.
8. No inventes reglas o progresiones de clases: utilizá una fuente de reglas verificable.
9. Separá claramente contenido oficial, heredado de 2014 y homebrew.
10. Ejecutá las pruebas disponibles y verificá el funcionamiento de las pantallas reales.

**Resultado esperado:** un creador de personajes visualmente claro, flexible y conectado al backend, acompañado de un sistema de progresión de nivel 1 a 20 que calcule correctamente las estadísticas y permita personalizar todas las decisiones relevantes.
