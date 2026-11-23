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
| Modelo `Reserva` (modelo común con `Usuario`) | Existe: estados PENDIENTE, CONFIRMADA, RECHAZADA y CANCELADA. |
| Listado y filtro en `src/app/reservas/page.tsx` | Implementados (B-04 y B-05): lee reservas de PostgreSQL y filtra por estado. |
| Registrar una solicitud (`/reservas/nueva`) | Implementado (B-06): crea solicitudes PENDIENTE. |
| Aprobar, rechazar, cancelar y comprobar conflictos | **Solo previstos** en este documento. |
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


## Pruebas B-04: listado de reservas

La página `/reservas` lee las reservas de PostgreSQL con `obtenerReservas()` (`src/lib/data/reservas.ts`). Solicitante, espacio, centro y responsable se traen por sus relaciones (IDs), no por texto. Las fechas se presentan siempre en `Europe/Madrid`, aunque el servidor esté en otra zona.

**Límite:** esta lectura no implementa login, autorización, «Mis reservas» ni control de disponibilidad. Es una pantalla local de prácticas con datos ficticios.

Datos: seed del proyecto (12 reservas, 2–6/11/2026).

| Caso | Datos usados | Esperado | Observado |
|---|---|---|---|
| Listado completo | `/reservas` | 12 reservas ordenadas por inicio | 12 filas, de 2/11/26 10:00 a 6/11/26 17:00, en orden |
| Pendiente sin resolución | Reservas PENDIENTE (resolución null) | «Pendiente de resolución», sin errores | Las 4 pendientes muestran «Pendiente de resolución» |
| Confirmada con responsable | Ana Pruebas, Pista 1, 2/11 16:00–17:00 | Estado Confirmada, responsable y fecha | «Confirmada», «Coordinación Pruebas · 30/10/26, 11:00» |
| Rechazada con motivo | Club ficticio Lúa, Pista 1, 2/11 19:30 | Rechazada, responsable, fecha y motivo | «Rechazada», «Recepción Pruebas · 30/10/26, 11:00», motivo del cierre |
| Cancelada de usuario inactivo | Usuario retirado Pruebas, Sala 2 | Se conserva y muestra el motivo | Aparece «Cancelada» con su motivo |
| Dos usuarios con el mismo nombre | `seed-usuario-ana` (3 reservas) y `seed-usuario-ana2` (2) | Cada reserva ligada a su ID | 5 filas «Ana Pruebas», que coinciden con las 3 + 2 de la BD por ID |
| Zona horaria | Reserva guardada 2026-11-02T15:00Z | 16:00 en Madrid | Se muestra 2/11/26, 16:00 |
| Datos privados | HTML de `/reservas` | Sin emails ni datos de autenticación | No aparece ningún email |
| Sin reservas | Base local vacía aparte (sin borrar el seed) | Mensaje comprensible | «No hay reservas registradas» |
| Fallo de lectura | PostgreSQL detenido | Error de lectura, no lista vacía | «No se han podido cargar los datos. Comprueba la conexión…» |

## Filtro de reservas por estado (B-05)

La página `/reservas` permite consultar las reservas por estado con un formulario HTML GET (`?estado=`). Es solo lectura: no crea, aprueba, rechaza ni cancela, y no es una autorización ni «Mis reservas».

### Funcionamiento

- El formulario envía el estado elegido en la URL; recargar o compartir la URL mantiene el filtro.
- La página espera `searchParams` en el servidor y valida el valor antes de consultar:
  - Sin parámetro, vacío o `TODOS`: se muestran todas las reservas.
  - Uno de los cuatro estados: se comprueba que pertenece al enum `EstadoReserva` de Prisma (sin cast) y se pasa a `obtenerReservas(estado)`.
  - Valor desconocido o parámetro repetido: aviso de filtro no válido con enlace para quitarlo. **No se consulta** ni se listan reservas.
- Prisma aplica el filtro con `where: { estado }`; sin estado no añade condición. Se conservan el orden por inicio y la zona Europe/Madrid.
- Se muestran el filtro seleccionado y el total de resultados.
- La sección de centros y espacios no depende del filtro.

### Estados permitidos

| Valor | Significado |
|---|---|
| TODOS | Todas las reservas |
| PENDIENTE | Solicitud pendiente |
| CONFIRMADA | Reserva confirmada |
| RECHAZADA | Solicitud rechazada |
| CANCELADA | Reserva cancelada |

### Pruebas B-05

| URL de prueba | Esperado | Observado |
|---|---|---|
| `/reservas` | Todas las reservas | 12 filas; «Todos los estados»; total 12 |
| `/reservas?estado=` | Igual que sin filtro | 12 filas; select en Todos |
| `/reservas?estado=TODOS` | Todas las reservas | 12 filas; total 12 |
| `/reservas?estado=PENDIENTE` | Solo pendientes | 4 filas, todas Pendiente; total 4 |
| `/reservas?estado=CONFIRMADA` | Solo confirmadas | 4 filas, todas Confirmada; total 4 |
| `/reservas?estado=RECHAZADA` | Solo rechazadas | 2 filas, todas Rechazada; total 2 |
| `/reservas?estado=CANCELADA` | Solo canceladas | 2 filas, todas Cancelada; total 2 |
| `/reservas?estado=INVENTADO` | Aviso de filtro no válido, sin consultar | Aviso «El filtro no es válido…» y enlace Quitar filtro; ninguna fila |
| `/reservas?estado=pendiente` | Aviso (los valores distinguen mayúsculas) | Aviso de filtro no válido; ninguna fila |
| `/reservas?estado=PENDIENTE&estado=CONFIRMADA` | Aviso de parámetro repetido | Aviso de filtro no válido; ninguna fila |
| Elegir «Cancelada» y pulsar Filtrar | URL y select reflejan el filtro | URL `?estado=CANCELADA`, 2 filas; al recargar el select sigue en Cancelada |
| Quitar filtro | Vuelve a todas | URL `/reservas`, 12 filas |
| Filtro válido sin coincidencias | Mensaje específico | Base vacía aparte: «No hay resultados con este filtro» con enlace Quitar filtro |
| PostgreSQL detenido con `?estado=PENDIENTE` | Error de lectura, no lista vacía | «No se han podido cargar los datos…» |

## Documentación B-06: registrar una solicitud

### Finalidad y recorrido

Recepción recibe una petición y la registra para un usuario existente. Desde `/reservas`, el enlace **Nueva solicitud** abre `/reservas/nueva`. Se elige solicitante, espacio, inicio y fin, y se pulsa **Registrar solicitud**. Si todo es válido, se vuelve a `/reservas?estado=PENDIENTE` con el aviso «Solicitud registrada, pendiente de revisión» y la fila nueva resaltada. Si algo falla, se vuelve al formulario con el motivo.

Elegir a la persona solicitante **no inicia sesión como ella**: es el dato de quién pide la reserva. La autenticación del operador (Recepción) es otra capa, todavía no implementada.

### Campos, reglas y resultados

| Campo | Control | Regla en el servidor |
|---|---|---|
| Solicitante | Select con usuarios activos: nombre e ID visible | Un único texto no vacío. Se vuelve a consultar que el usuario existe y está activo |
| Espacio | Select «Centro — Espacio» con espacios activos de centros activos | Un único texto no vacío. Se vuelve a consultar que el espacio y su centro existen y están activos |
| Inicio y fin | `datetime-local` | Instante ISO con zona explícita (`Z` o `±HH:MM`), fecha real, inicio futuro y fin posterior al inicio |

- El estado **PENDIENTE lo fija el servidor**. Responsable, fecha de resolución y motivo quedan a `null`. Si el navegador envía `estado`, `resueltaPorId` u otros campos, se ignoran.
- Un ID manipulado no se acepta por venir de un select: se comprueba en la base de datos dentro de una transacción, junto con la inserción.
- Registrar una solicitud **no comprueba disponibilidad ni bloquea el espacio**. Dos pendientes pueden pedir la misma franja. No se aprueba ni se modifica ninguna reserva existente.
- Resultados posibles: confirmación en `/reservas` o `/reservas/nueva?error=` con `campos`, `fecha`, `pasado`, `orden`, `solicitante`, `espacio` o `guardar`.

### Fechas y zona horaria

El campo `datetime-local` se interpreta en la zona del dispositivo. El cliente lo convierte a un instante UTC (`toISOString()`) y lo envía en campos ocultos `inicio` y `fin`. El servidor solo acepta instantes con zona explícita y los guarda tal cual (`timestamptz`). El listado los muestra en `Europe/Madrid`. Así el desplazamiento se aplica una sola vez.

Los equipos deben estar configurados en Europe/Madrid. El formulario muestra la zona del dispositivo y avisa si no es Europe/Madrid. La zona se lee solo en el navegador, para que el HTML del servidor coincida y no haya error de hidratación.

Si la fecha escrita no es válida (por ejemplo, un año de más de 4 cifras), el formulario no se rompe: avisa y no permite enviar. El rango admitido en el campo es de 2000 a 2099.

### Archivos y responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `src/app/reservas/page.tsx` | Enlace «Nueva solicitud», confirmación (solo si la solicitud existe y está pendiente) y listado |
| `src/app/reservas/nueva/page.tsx` | Pantalla, carga de opciones, mensajes de error y avisos si faltan opciones |
| `src/app/reservas/nueva/formulario.tsx` | Formulario con controles shadcn (`Label`, `NativeSelect`, `Input`, `Button`), conversión a ISO, zona del dispositivo y bloqueo de doble envío |
| `src/app/reservas/actions.ts` | `crearSolicitud`: lee y valida el `FormData`, llama a la inserción, revalida `/reservas` y redirige |
| `src/lib/data/reservas.ts` | `obtenerOpcionesSolicitud` (usuarios y espacios activos) y `obtenerReservas` (lecturas de B-04/B-05) |
| `src/lib/mutations/reservas.ts` | `insertarSolicitudPendiente`: comprueba usuario, espacio y centro activos y crea la reserva PENDIENTE |

### Decisiones técnicas

- **Confirmación:** `/reservas?estado=PENDIENTE&creada=<id>`. El aviso solo aparece si esa solicitud existe y está pendiente, así que no se puede fingir escribiendo una URL.
- **Doble envío:** el botón se desactiva durante el envío y se ignora un segundo envío mientras el primero está en curso. Un doble clic crea una sola solicitud.
- **Homónimos:** se muestra el ID junto al nombre, porque hay dos «Ana Pruebas».
- **Duración y antelación:** no hay límites de duración ni de antelación (ver Duda 3). Una solicitud puede abarcar varios días.

### Pendientes y límites

- No hay autenticación ni permisos de gestión. Antes de exponer esta operación fuera del entorno local hay que verificar que quien la usa es Recepción.
- No se implementan aprobación, rechazo, cancelación, cálculo de disponibilidad, calendario ni edición del intervalo.
- Sin JavaScript el formulario no puede convertir las fechas, por lo que el botón queda desactivado.

### Pruebas B-06

Datos: seed del proyecto. El caso «sin opciones» se probó en una base local vacía aparte, sin borrar el seed.

| Caso | Datos usados | Esperado | Observado |
|---|---|---|---|
| Enlace y opciones | `/reservas` → Nueva solicitud | Abre `/reservas/nueva`; 7 usuarios activos con ID visible; espacios activos de centros activos; sin emails | 7 usuarios (las dos Ana se distinguen por ID), 4 espacios «Centro — Espacio», sin emails |
| Alta válida | Brais Pruebas, Pista 1, 1/12/2026 10:00–11:30 (Madrid) | Fila PENDIENTE con IDs correctos, sin resolución; confirmación y fila en el filtro PENDIENTE | Confirmación «Solicitud registrada, pendiente de revisión», fila resaltada 1/12/26 10:00–11:30; en BD PENDIENTE, IDs correctos, resolución null |
| Persiste tras recargar | Recargar `/reservas?estado=PENDIENTE` | La fila sigue | 5 pendientes, incluida la nueva |
| Horas en Madrid | Entrada 10:00 en Madrid | Se envía 09:00Z y se muestra 10:00 | Enviado `2026-12-01T09:00:00.000Z`, guardado 09:00 UTC, mostrado 10:00 |
| Dispositivo en otra zona | Navegador en Atlantic/Canary, 10:00 | Muestra la zona y avisa; 10:00 Canarias = 11:00 Madrid | Muestra «Atlantic/Canary» y el aviso; listado 11:00; sin errores de hidratación |
| Misma franja que otra pendiente | Brais, Pista 1, 1/12 10:00–11:30 otra vez | Se acepta como pendiente | Creada; 2 pendientes en esa franja |
| Inicio en el pasado | 1/1/2025 | `error=pasado`, no guarda | Redirige con «La fecha de inicio debe ser futura.»; 0 filas |
| Fin anterior / igual | 12:00–11:00 y 12:00–12:00 | `error=orden`, no guarda | Ambos rechazados; 0 filas |
| ISO sin zona | `inicio=2026-12-02T10:00` | `error=fecha` | Rechazado; 0 filas |
| ISO imposible | `2027-02-30T10:00:00.000Z` | `error=fecha` | Rechazado; 0 filas |
| ISO con desplazamiento | `2026-12-02T10:00:00+01:00` | Se acepta | Creada |
| Campo vacío | Espacio vacío, saltando la validación del navegador | `error=campos` | Rechazado; 0 filas |
| Campo repetido | Dos campos `fin` | `error=campos` | Rechazado; 0 filas |
| Campo como archivo | `inicio` enviado como fichero | `error=campos` | Rechazado; 0 filas |
| Solicitante inexistente / inactivo | `no-existe` / `seed-usuario-inactivo` | `error=solicitante` | Ambos rechazados; 0 filas |
| Espacio inexistente / inactivo / de centro inactivo | `no-existe`, espacio inactivo, Pista 1 de Centro Arquivo | `error=espacio` | Los tres rechazados; 0 filas |
| Estado y resolución inyectados | `estado=CONFIRMADA`, `resueltaPorId`, `motivoResolucion`, `resueltaEn` | Se ignoran; PENDIENTE sin resolución | Guardada PENDIENTE con los tres campos de resolución a null |
| Año de 6 cifras | Teclear «2» repetidamente en la fecha | No se rompe; no permite enviar | Sin errores; botón desactivado |
| Doble y triple clic | Pulsar Registrar varias veces seguidas | Una sola solicitud | 1 fila en ambos casos |
| Confirmación falsa | `/reservas?creada=no-existe` | Sin aviso de éxito | No muestra confirmación |
| No altera otras reservas | Contar confirmadas antes y después | Sin cambios | 4 → 4 |
| Sin opciones | Base local vacía aparte | Explica qué falta y deshabilita el envío | Avisos de usuarios y espacios; selects y botón desactivados |
| Error de lectura | PostgreSQL detenido | Mensaje de error | «No se han podido cargar los usuarios y espacios…» |

### Aportaciones

_(Completar antes de la PR, para B-04, B-05 y B-06: nombre — qué hizo o comprobó cada integrante.)_
