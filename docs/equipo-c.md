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

