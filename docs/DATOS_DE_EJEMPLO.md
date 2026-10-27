# Datos de ejemplo para los tres equipos

Desde la raíz del repo, con PostgreSQL local arrancado y `.env` preparado:

```sh
pnpm run db:deploy
pnpm run db:generate
pnpm run db:seed
pnpm run db:studio
```

El seed carga datos ficticios, no funciones terminadas. No crea cuentas de login ni aplica permisos. Solo se permite en PostgreSQL local, no en producción. El resumen de terminal muestra el total de vuestra base, incluidos los registros propios.

## Qué contiene en una base vacía

| Modelo | Cantidad | Casos para practicar |
|---|---|---|
| Usuario | 8 | ADMIN, dos GESTOR, usuarios normales, uno inactivo y dos Ana Pruebas con IDs distintos |
| Centro | 5 | Varios centros activos, uno sin espacios, uno inactivo y otro con solo un espacio inactivo |
| Espacio | 7 | Recursos activos e inactivos, un espacio sin horario y nombres repetidos en centros distintos |
| HorarioApertura | 20 | Días laborables, sábados y mañana/tarde separadas; domingos sin apertura |
| Cierre | 5 | Activos, anulado y uno de varios días |
| Reserva | 12 | 4 confirmadas, 4 pendientes, 2 rechazadas y 2 canceladas |
| Actividad | 5 | Con varias sesiones, sin sesiones, descripción opcional y una actividad retirada |
| Sesion | 8 | 6 programadas y 2 canceladas; tres recursos distintos |

Los correos terminan en `@example.test`. No introduzcáis correos, nombres ni otra información personal real. Los IDs nuevos de prácticas llevan el prefijo `seed-`; Centro Lúa y sus espacios pueden mantener los IDs de vuestro seed anterior.

## Equipo A: recursos, horarios y cierres

- **Centro Lúa (ejemplo):** conserva Pista 1 y Sala 2. Pista 1 abre de lunes a viernes de 09:00 a 22:00 y el sábado de 10:00 a 14:00.
- **Sala 2:** lunes y miércoles abre de 09:00 a 14:00 y de 16:00 a 22:00. Un uso de 13:30 a 16:30 atraviesa tiempo cerrado.
- **Centro Mar (ejemplo):** Piscina, Sala sen horario y Pista exterior inactiva. Sin horario no significa abierto todo el día.
- **Centro sen espazos (ejemplo):** no debe desaparecer de la lista por no tener espacios.
- **Centro Arquivo (ejemplo):** está inactivo aunque su Pista 1 tenga activo=true. Se debe considerar también el estado del centro antes de nuevos usos.
- **Centro Reformas (ejemplo):** solo tiene Sala en reforma, inactiva. Permite comprobar centro sin espacios activos.
- Hay cierres de mantenimiento, revisión, limpieza, uno anulado y otro que cruza varios días. No borrar el anulado para ocultarlo: se muestra su situación.

## Equipos B y C: fechas y ocupación

Los ejemplos usan fechas fijas del **2 al 8 de noviembre de 2026**, en Europe/Madrid. No cambian de semana al repetir el seed. El 2 es lunes. Esas fechas tienen UTC+1; no se debe aplicar ese offset fijo a todo el año.

Casos principales del lunes 2 en Pista 1:

| Intervalo local | Registro | Qué demuestra |
|---|---|---|
| 16:00–17:00 | Reserva confirmada de una Ana Pruebas | Solicitante por ID, no por nombre |
| 17:00–18:00 | Reserva confirmada de la otra Ana Pruebas | Dos usos que se tocan son compatibles |
| 17:30–18:30 | Reserva pendiente de Brais | Puede solicitarse, pero no confirmarse mientras haya conflicto |
| 18:00–19:00 | Sesión programada de bádminton | Reservas y sesiones comparten ocupación |
| 19:00–20:00 | Cierre activo por mantenimiento | Impide nuevas confirmaciones en ese intervalo |
| 19:30–20:30 | Reserva rechazada | Conserva responsable, fecha y motivo de rechazo |
| 20:00–21:00 | Reserva cancelada y cierre anulado | Ninguno bloquea por sí mismo, pero hay que comprobar el resto de factores |

B puede comprobar pendientes con resolución null, confirmadas resueltas por GESTOR, cancelación por la propia solicitante y conservación de un usuario inactivo en una reserva cancelada. Un gestor también tiene una solicitud pendiente propia: su rol no debe permitir aprobarla él mismo cuando se implemente esa operación.

C puede mostrar bádminton con tres sesiones, una cancelada; Yoga con descripción null; Natación en otro centro; Actividad por planificar sin sesiones; y Curso retirado inactivo con su sesión cancelada. Una actividad sin sesiones sigue visible.

Prisma Studio modifica registros directamente y no ejecuta las reglas de negocio. Los ejemplos iniciales no tienen reservas confirmadas o sesiones programadas que se solapen entre sí o con cierres activos. Sí hay peticiones pendientes con conflictos deliberados: no bloquean espacio ni demuestran que ya exista disponibilidad implementada.

## Qué ocurre al repetir el seed

- No borra tablas ni datos propios.
- No actualiza los ejemplos existentes, incluidos cambios de nombre, estado o activo que hayáis probado. No es un reset.
- Utiliza IDs estables y reutiliza las claves naturales previas de usuarios, centros, espacios y horarios cuando corresponde.
- Si elimináis un ejemplo, puede volver a crearlo; no borréis registros para preparar pruebas sin acordarlo.
- Las restricciones únicas siguen vigentes. Una edición que reutilice claves de otro ejemplo puede impedir completar el seed; se revierte su transacción, no se resuelve borrando vuestra información.

Para comprobar un caso vacío no eliminéis toda la base: ya existen centros/actividades sin hijos y recursos sin horarios. Para una tabla completamente vacía utilizad una base local de prueba separada o consultad al profesor.

El comando `pnpm run db:check --seeded` está pensado para CI en una base inicial de prueba. Después de vuestras ediciones o ampliaciones, usad `pnpm run db:check` y los criterios de vuestra issue.
