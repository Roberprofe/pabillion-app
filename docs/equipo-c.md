# Equipo C: Actividades y sesiones

## 1. Diferencia entre actividad y sesión

Una **actividad** es lo que se quiere organizar. Por ejemplo, un entrenamiento de fútbol. Contiene la información general de la actividad y puede tener varias sesiones.

Una **sesión** es una realización concreta de una actividad en una fecha, horario y espacio determinados. Por ejemplo, un entrenamiento de fútbol el lunes de 17:00 a 18:00 en el Campo 1.

Por tanto, una actividad puede tener varias sesiones, pero cada sesión corresponde a un momento concreto.

### Información necesaria

De una actividad necesitamos conocer:

- **Nombre:** para identificar la actividad.
- **Descripción y objetivo:** para explicar en qué consiste y qué se quiere conseguir.
- **Duración prevista:** cuánto tiempo dura normalmente.
- **Número de participantes:** cuántas personas pueden participar.
- **Espacio o recursos necesarios:** qué tipo de espacio se necesita y qué materiales hacen falta para realizarla.

De una sesión necesitamos conocer:

- **Actividad asociada:** para saber a qué actividad pertenece.
- **Fecha y horario:** para saber cuándo empieza y termina.
- **Espacio asignado:** para saber dónde se realiza.
- **Estado:** para distinguir si la sesión está prevista, confirmada o cancelada.

La diferencia principal es que los datos de la actividad describen qué se quiere hacer, mientras que los datos de la sesión indican cuándo y dónde se realiza. Una misma actividad puede tener varias sesiones con diferentes fechas, horarios y espacios.

## 2. Ejemplo de una actividad con varias sesiones

Vamos a utilizar como ejemplo una actividad de entrenamiento de fútbol.

**Actividad: Entrenamiento de fútbol**

- Objetivo: mejorar la técnica, los pases y el trabajo en equipo.
- Duración prevista: 60 minutos.
- Participantes: 15 personas.
- Espacio necesario: campo de fútbol.
- Recursos: balones, conos y petos.

Esta actividad puede organizarse en diferentes sesiones:

| Sesión | Fecha | Horario | Espacio |
|---|---|---|---|
| Sesión 1 | 19/10/2026 | 17:00–18:00 | Campo 1 |
| Sesión 2 | 21/10/2026 | 17:00–18:00 | Campo 1 |
| Sesión 3 | 23/10/2026 | 17:00–18:00 | Campo 2 |

Las tres sesiones pertenecen a la misma actividad, pero tienen fechas y espacios diferentes.

Si cambia el horario de una sesión, no es necesario cambiar la información general de la actividad. Solo se modifica la información de esa sesión.

## 3. Relación con los otros equipos

### Qué necesitamos del equipo A

Necesitamos conocer cómo se organizan los espacios disponibles y los cierres o restricciones que puedan afectar a una sesión.

Esta información nos permite comprobar si un espacio puede utilizarse en la fecha y el horario previstos.

### Qué necesitamos del equipo B

Necesitamos conocer cómo se gestionan las reservas y qué información necesita el sistema para comprobar si una sesión puede realizarse en un espacio y horario determinados.


### Qué aporta el equipo C al equipo B

Nuestro equipo aporta la información necesaria para entender las actividades y sus sesiones, incluyendo la relación entre ambas y los datos que permiten identificar cuándo y dónde se realiza cada sesión.

El equipo B necesita conocer qué sesiones están confirmadas y qué espacios ocupan para poder comprobar la disponibilidad antes de gestionar una reserva.

Por ejemplo, si una sesión de entrenamiento de fútbol está confirmada para el lunes de 17:00 a 18:00 en el Campo 1, esa información debe tenerse en cuenta al comprobar si otra reserva puede utilizar el mismo campo durante ese horario.

## 4. Propuesta para las sesiones confirmadas cuando se cierra un espacio

Si una sesión ya está confirmada, pero el espacio asignado se cierra de repente, proponemos que el sistema intente encontrar una alternativa antes de cancelar la sesión.

Por ejemplo, un entrenamiento de fútbol está confirmado para el lunes de 17:00 a 18:00 en el Campo 1, pero el equipo A comunica que el campo estará cerrado ese día.

Proponemos seguir este orden:

1. **Buscar otro espacio para el mismo horario.** El sistema comprueba si existe otro espacio disponible que sea adecuado para la actividad, tenga capacidad suficiente y no esté cerrado ni ocupado durante ese horario. Si encuentra uno, propone cambiar la sesión a ese espacio.

2. **Buscar otro horario o fecha.** Si no hay ningún espacio adecuado disponible en el horario original, el sistema busca otra fecha u horario en el que exista un espacio disponible y adecuado para realizar la actividad.

3. **Cancelar la sesión si no hay alternativas.** Si no se encuentra ningún espacio ni horario adecuado, la sesión se cancela y su estado se actualiza para que no siga considerándose una sesión confirmada que ocupa el espacio original.

Consideramos que este orden permite mantener las actividades siempre que sea posible y evita cancelar sesiones cuando existe una alternativa válida.

Los cambios deben afectar únicamente a la sesión correspondiente, no a toda la actividad. Por ejemplo, si se cancela un entrenamiento concreto, las demás sesiones del entrenamiento de fútbol pueden seguir programadas.

También proponemos que los cambios de horario o espacio se comuniquen a las personas responsables de la actividad y que se confirme el cambio cuando sea necesario. Antes de aplicar una alternativa, el sistema debe comprobar de nuevo la disponibilidad para evitar conflictos con otras sesiones o reservas.

Esta es nuestra propuesta inicial y debe coordinarse con los equipos A y B para definir cómo se gestionan los cierres de espacios, los cambios de sesiones y las reservas existentes.

## 5. Propuesta de campos para Actividad y Sesión

Los siguientes campos son una propuesta inicial para el diseño de los modelos `Actividad` y `Sesion`. No están implementados en el esquema actual de Prisma y deberán revisarse con los equipos A y B antes de tomar decisiones definitivas.

### 5.1. Campos de Actividad

| Campo | Finalidad | Relación |
|---|---|---|
| id | Identificar de forma única cada actividad. | Clave primaria. |
| nombre | Indicar el nombre de la actividad. | Sin relación directa obligatoria. |
| descripcion | Explicar en qué consiste la actividad y sus objetivos. | Sin relación directa obligatoria. |
| duracionPrevista | Indicar la duración habitual de la actividad. | Sin relación directa obligatoria. |
| participantesMaximos | Proponer un límite de participantes para la actividad. | Su relación con la capacidad del espacio debe coordinarse con los equipos A y B. |

### 5.2. Campos de Sesion

| Campo | Finalidad | Relación |
|---|---|---|
| id | Identificar de forma única cada sesión. | Clave primaria. |
| actividadId | Identificar la actividad a la que pertenece la sesión. | Clave foránea hacia Actividad. |
| espacioId | Identificar el espacio donde se realizará la sesión. | Clave foránea hacia Espacio. |
| fechaHoraInicio | Indicar la fecha y hora de inicio. | Debe permitir comprobar conflictos de horario. |
| fechaHoraFin | Indicar la fecha y hora de finalización. | Debe permitir comprobar conflictos de horario. |
| estado | Indicar la situación de la sesión, por ejemplo, prevista, confirmada o cancelada. | Los valores permitidos están pendientes de acordar. |
| ocupacionMaxima | Proponer un límite de ocupación específico para la sesión, si fuera necesario. | Debe coordinarse con la capacidad del espacio y el límite de participantes de la actividad. |

### 5.3. Relaciones y decisiones pendientes

Una actividad puede tener varias sesiones. Cada sesión pertenece a una actividad y está vinculada a un espacio concreto. La relación entre `Sesion` y `Espacio` permite identificar dónde se realizará cada sesión y comprobar posibles conflictos con otras sesiones o reservas.

Los campos anteriores son propuestas de diseño, no cambios aprobados en la base de datos. Actualmente, el esquema de Prisma contiene los modelos `Centro` y `Espacio`, pero todavía no contiene los modelos `Actividad` y `Sesion`.

Antes de implementar estos modelos, quedan pendientes las siguientes decisiones:

- **Estado:** acordar los estados permitidos para una sesión y las transiciones entre ellos.
- **Ocupación:** decidir si el límite de participantes se define en la actividad, en cada sesión, en el espacio o mediante una combinación de estos datos.
- **Fecha y hora:** acordar cómo se almacenarán las fechas, las horas y la zona horaria, teniendo en cuenta las necesidades del proyecto.
- **Disponibilidad:** coordinar con los equipos A y B cómo se comprobarán los cierres de espacios, las reservas y los conflictos de horario.

## 6. Pruebas C-03

Se han realizado comprobaciones manuales de la página `src/app/actividades/page.tsx` utilizando los datos de ejemplo de la base de datos local.

| Prueba | Resultado esperado | Resultado obtenido |
|---|---|---|
| Acceder a la página de actividades. | Mostrar el título y la información de planificación. | Correcto. Se muestra «Actividades y sesiones» y el texto informativo. |
| Consultar los centros registrados. | Mostrar los centros y agrupar sus espacios debajo de cada uno. | Correcto. Se muestra «Centro Lúa (ejemplo)» con sus espacios. |
| Consultar los espacios del centro de ejemplo. | Mostrar los espacios activos ordenados por nombre. | Se muestran «Pista 1» y «Sala 2». La ordenación y el filtrado deben verificarse también con datos de prueba que permitan comprobar ambos comportamientos. |
| Consultar un centro sin espacios activos. | Mantener visible el centro e indicar que no tiene espacios activos. | Pendiente de comprobar con datos de prueba específicos. |
| Consultar una base de datos sin centros. | Mostrar un mensaje indicando que no hay centros registrados. | Correcto. Se observó el mensaje «No hay centros registrados» antes de cargar los datos de ejemplo. |
| Comprobar el aviso de disponibilidad. | Advertir que la lista no confirma disponibilidad ni la existencia de actividades o sesiones. | Correcto. El aviso aparece en la página. |

Las pruebas se han realizado en el entorno local. Las comprobaciones pendientes deberán realizarse con datos de prueba adecuados, sin eliminar registros existentes ni modificar datos compartidos. Los errores de conexión con la base de datos deben identificarse como errores y no confundirse con una lista vacía.

Esta página sirve para consultar los centros y sus espacios activos como apoyo a la planificación. No implementa todavía la creación de actividades, la programación de sesiones ni la confirmación de reservas.
