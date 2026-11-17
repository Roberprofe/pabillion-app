## Qué hacemos

El equipo B se ocupa del recorrido de una solicitud de reserva: desde que una persona pide un espacio en una fecha y franja, hasta que Recepción decide sobre ella (aprobar o rechazar) y, si hace falta, se cancela. Somos responsables de:

- Los **estados** de una solicitud y las **transiciones** permitidas.
- Comprobar **conflictos antes de aprobar**.
- Conservar el **historial**: nada desaparece sin dejar rastro.

No somos dueños de los espacios, horarios y cierres (equipo A) ni de las sesiones de actividades (equipo C). No creamos una lista paralela de pistas: usamos los espacios que define A.

### Qué hay hoy y qué es solo previsto

| Elemento | Situación actual |
|---|---|
| Modelos de Prisma `Centro` y `Espacio` | Existen (equipo A). |
| Página inicial `src/app/reservas/page.tsx` | Existe como punto de partida; no demuestra que consulte la base de datos. |
| Modelo de solicitud de reserva | **No existe todavía.** |
| Estados, transiciones y comprobación de conflictos | **Solo previstos** en este documento. |
| Permisos (quién puede aprobar) | **Solo previstos.** Cuando se implementen se comprobarán también en el servidor, no solo ocultando botones. |

## Conceptos y reglas

### Información que necesita una solicitud

| Dato | Descripción |
|---|---|
| Persona solicitante | Quién pide la franja (en pruebas, personas ficticias). |
| Espacio | Espacio reservable, identificado con el identificador común de A. |
| Fecha | Día de la franja solicitada. |
| Hora de inicio y hora de fin | Franja pedida. El fin debe ser posterior al inicio. |
| Estado | Pendiente, aprobada, rechazada o cancelada. |
| Motivo de la decisión | Obligatorio al rechazar o cancelar. Explica el conflicto o la razón. |
| Persona que decide | Recepción, cuando aprueba o rechaza. |

Quién interviene:

- **Solicitante o club:** consulta espacios, pide una franja y ve la respuesta. No puede aprobar su propia solicitud ni modificar la de otra persona.
- **Recepción:** registra peticiones (también las telefónicas, en el mismo sistema), revisa y decide. Debe comprobar las reglas antes de aprobar.

### Estados

| Estado | Significado | ¿Bloquea el espacio? |
|---|---|---|
| **Pendiente** | Petición recibida que aún necesita decisión. No significa que la pista esté confirmada. | No |
| **Aprobada** | Recepción comprobó las reglas y la franja queda confirmada. | Sí |
| **Rechazada** | Recepción la denegó con una explicación. | No |
| **Cancelada** | Se anuló después de crearse; la franja se libera y se conserva el historial. | No |

«Revisar» es una acción de Recepción sobre una solicitud pendiente, no un estado.

### Transiciones

| Estado de origen | Acción | Quién la realiza | Estado final |
|---|---|---|---|
| (nueva) | Solicitar | Solicitante, o Recepción si es telefónica | Pendiente |
| Pendiente | Aprobar | Recepción, solo si pasa las comprobaciones | Aprobada |
| Pendiente | Rechazar (con motivo) | Recepción | Rechazada |
| Pendiente | Cancelar | Solicitante o Recepción | Cancelada |
| Aprobada | Cancelar (con motivo) | Solicitante o Recepción | Cancelada |

Transiciones o permisos **no decididos todavía** (ver «Dudas pendientes»):

- Quién puede cancelar una reserva aprobada de otra persona y con qué plazo.
- Si Recepción puede aprobar con una hora distinta a la pedida. De momento se considera que **no**.

Reglas:

- **Rechazada** y **Cancelada** son estados finales. Para insistir se crea una solicitud nueva.
- Una solicitud pendiente **no bloquea** el espacio. Dos pendientes pueden pedir la misma hora, pero solo una podría aprobarse.
- Las reservas aprobadas, las sesiones confirmadas y los cierres **sí** impiden nuevas aprobaciones incompatibles.
- Dos franjas que solo se tocan en el extremo (18:00–19:00 y 19:00–20:00) son compatibles por ahora.
- Si un cierre nuevo afecta a una reserva aprobada, no se cancela en silencio: se señala y Recepción decide de forma visible.

### Comprobaciones antes de aprobar

1. La persona que decide tiene permiso.
2. El espacio y su centro existen y están activos (**dato de A**).
3. La franja cae dentro del horario del espacio (**dato de A**).
4. No se solapa con un cierre (**dato de A**).
5. No se solapa con otra reserva aprobada (**dato propio de B**).
6. No se solapa con una sesión confirmada (**dato de C**).

Si falla alguna, la solicitud no se aprueba: se rechaza o se devuelve con una explicación.

## Ejemplos de funcionamiento

Datos ficticios: Asociación Lúa, Centro Lúa, «Pista 1», con horario de tarde de 16:00 a 22:00.

### Caso 1 — Solicitud sin conflicto

| Campo | Valor |
|---|---|
| Situación inicial | Pista 1 no tiene cierres, reservas aprobadas ni sesiones confirmadas el jueves 15/10/2026. |
| Espacio | Pista 1 (Centro Lúa) |
| Fecha | Jueves 15/10/2026 |
| Horas | 18:00–19:30 |
| Acción del usuario | El Club Marea solicita la pista. Queda **Pendiente**. Recepción la revisa y la aprueba. |
| Resultado esperado | Pasa a **Aprobada** y la franja 18:00–19:30 queda ocupada. |
| Motivo | Está dentro del horario y no choca con ningún cierre, reserva ni sesión. Mientras estuvo pendiente no bloqueaba nada. |

### Caso 2 — Solicitud que coincide con un uso existente

| Campo | Valor |
|---|---|
| Situación inicial | La reserva del Club Marea (jueves 15/10/2026, 18:00–19:30) está **Aprobada** en Pista 1. Hay una solicitud **Pendiente** de otra persona para 19:00–20:00. |
| Espacio | Pista 1 (Centro Lúa) |
| Fecha | Jueves 15/10/2026 |
| Horas | 19:00–20:00 (solicitada) frente a 18:00–19:30 (aprobada) |
| Acción del usuario | Recepción intenta aprobar la solicitud de 19:00–20:00. |
| Resultado esperado | No se aprueba. Se rechaza o se devuelve con el motivo: «conflicto con la reserva aprobada de 18:00 a 19:30 (se solapan 19:00–19:30)». La reserva existente sigue Aprobada. |
| Motivo | Una reserva aprobada bloquea el espacio y las dos franjas se pisan. |

Variante compatible: si la solicitud fuese de 19:30 a 20:30, las franjas solo se tocan en el extremo y podría aprobarse, salvo otra restricción.

### Caso 3 — Solicitud con el espacio cerrado

| Campo | Valor |
|---|---|
| Situación inicial | Mantenimiento registró un cierre de Pista 1 desde el viernes 16/10/2026 a las 16:00 hasta el domingo 18/10/2026 a las 22:00 por avería. Hay una solicitud **Pendiente** para el sábado 17/10/2026. |
| Espacio | Pista 1 (Centro Lúa) |
| Fecha | Sábado 17/10/2026 |
| Horas | 10:00–11:00 |
| Acción del usuario | Recepción intenta aprobarla. |
| Resultado esperado | No se aprueba. Se rechaza con el motivo «Pista 1 cerrada de viernes 16:00 a domingo 22:00». |
| Motivo | Un cierre impide nuevas aprobaciones en ese periodo, aunque no haya otra reserva. |

## Qué necesitamos de los otros equipos y qué les damos

### Lo que necesitamos de A (centros, espacios, horarios y cierres)

| Dato | Para qué lo usamos |
|---|---|
| Identificador único y estable de espacio y su centro | Que la solicitud se refiera a «Pista 1» sin lista paralela. |
| Si el espacio y su centro están activos | No aprobar usos en espacios desactivados. |
| Horario de apertura del espacio por día | Comprobar que la franja cae dentro del horario. |
| Cierres: espacio, fecha y hora de inicio y fin, motivo | Impedir aprobaciones durante un cierre y explicar el rechazo. |
| Aviso cuando un cierre nuevo afecta a reservas aprobadas | Señalar las reservas afectadas y que Recepción decida. |

### Lo que necesitamos de C (actividades y sesiones)

| Dato | Para qué lo usamos |
|---|---|
| Sesiones **confirmadas**: espacio, fecha, hora de inicio y fin | Impedir aprobar una reserva que choque con una sesión. |
| Aviso cuando una sesión pasa a confirmada, cambia de fecha o se cancela | Mantener coherente la disponibilidad. |

### Lo que damos

| A quién | Qué comunicamos | Para qué lo usan |
|---|---|---|
| A y C | Reservas aprobadas por espacio y franja (espacio, fecha, inicio, fin). | Detectar conflictos al registrar un cierre o confirmar una sesión. |
| A y C | Significado de los estados (pendiente no bloquea; aprobada sí). | Usar el mismo criterio en los tres equipos. |

Acuerdos compartidos propuestos: mismos identificadores de espacio, formato de fecha y hora común (por ejemplo `2026-10-15T18:00`) y franjas con fin exclusivo, de modo que 18:00–19:00 y 19:00–20:00 no chocan.

## Dudas pendientes

### Duda 1: ¿Se puede aprobar una solicitud con una hora distinta a la pedida?
- **Situación:** alguien solicita Pista 1 de 18:00 a 19:30, pero ya hay una reserva aprobada de 18:00 a 19:00. Solo 19:00–19:30 estaría libre.
- **Por qué bloquea:** si se permite, hay que decidir si la persona solicitante debe aceptar el cambio y qué estado tiene la solicitud mientras tanto. Podría exigir un estado nuevo.
- **Propuesta provisional:** no. Se rechaza con el conflicto explicado y se crea una solicitud nueva con la hora deseada.
- **Quién puede ayudarnos:** el profesor.

### Duda 2: ¿Hay un plazo mínimo para cancelar una reserva aprobada?
- **Situación:** una persona cancela una reserva aprobada diez minutos antes de la franja.
- **Por qué bloquea:** añadiría una condición a la transición Aprobada → Cancelada y habría que decidir si el plazo es igual para el solicitante y para Recepción.
- **Propuesta provisional:** sin plazo por ahora; la cancelación libera la franja y conserva el historial.
- **Quién puede ayudarnos:** el profesor.

### Duda 3: ¿Hay límites de duración o de antelación en una solicitud?
- **Situación:** alguien pide una pista de 08:00 a 22:00, o para dentro de dos años.
- **Por qué bloquea:** cada centro o espacio podría querer límites distintos. Si fueran configurables, afectaría a A.
- **Propuesta provisional:** sin límites de negocio hasta que haya un motivo real.
- **Quién puede ayudarnos:** el profesor y el equipo A.

### Duda 4: ¿Qué validaciones básicas se exigen al crear una solicitud?
- **Situación:** una solicitud con la hora de fin anterior a la de inicio, o con una fecha ya pasada.
- **Por qué bloquea:** hay que acordar si se rechaza al crearla o durante la revisión de Recepción.
- **Propuesta provisional:** rechazar al crear si el fin no es posterior al inicio o si la franja está en el pasado; no pasa a Pendiente.
- **Quién puede ayudarnos:** el profesor.

### Duda 5: ¿Quién decide si una sesión confirmada choca con una reserva ya aprobada?
- **Situación:** C confirma una sesión en Pista 1 el martes de 18:00 a 19:00, y ya existe una reserva aprobada en esa franja.
- **Por qué bloquea:** no sabemos cuál prevalece ni quién resuelve el conflicto, y afecta a la regla de no cancelar en silencio.
- **Propuesta provisional:** ninguna; hay que acordarlo con C.
- **Quién puede ayudarnos:** el equipo C y el profesor.