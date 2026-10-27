# PostgreSQL y Prisma 7

En este repositorio, PostgreSQL guarda los datos; Prisma define modelos y ofrece consultas tipadas; `@prisma/adapter-pg` conecta Prisma con el controlador PostgreSQL. Son tres piezas del mismo recorrido.

## Primera instalación

Por ahora, cada alumno utiliza una base local independiente. No necesitáis una cuenta ni una conexión remota del profesor. Todos trabajáis con el mismo esquema y las mismas migraciones, pero cada ordenador conserva sus propios datos de prueba.

En la raíz del repo, copiad `.env.example` a `.env` y seguid los comandos del README. `compose.yaml` ofrece PostgreSQL 17 en `localhost:5433`, con una base `gestion_deportiva` y credenciales ficticias para desarrollo local. El volumen conserva los datos al ejecutar `pnpm run db:down`. No uséis `docker compose down -v` para apagarlo: esa opción eliminaría el volumen y sus datos.

Utilizad la configuración Docker incluida para seguir el mismo procedimiento. Si ya tenéis PostgreSQL instalado localmente, consultad al profesor antes de cambiar la conexión: debe ser una base exclusiva de desarrollo, no una base con otros trabajos.

## Qué cambia con Prisma 7

La URL de las herramientas Prisma está en `prisma.config.ts`, no en el bloque `datasource` de `schema.prisma`. El generador es `prisma-client`, con salida explícita `src/generated/prisma`. Para importar el cliente se usa su archivo `client`, y al crearlo se pasa el adaptador `PrismaPg`. Encontraréis ejemplos antiguos con una configuración distinta: comparad siempre su versión con la de este repo.

## Modelo compartido

El esquema contiene ocho modelos: **Usuario, Centro, Espacio, HorarioApertura, Cierre, Reserva, Actividad y Sesion**. Una reserva utiliza un espacio y tiene un usuario solicitante; cuando se resuelve puede identificar a otro usuario responsable. Una actividad tiene cero o varias sesiones y cada sesión ocupa un espacio durante un intervalo.

Se conservan las relaciones Centro/Espacio y los datos iniciales. El nombre de un espacio es único dentro de su centro. Las relaciones restringen el borrado de registros referenciados para no destruir el historial. Las fechas nuevas de creación de espacios antiguos se rellenan al migrar: no reconstruyen su fecha histórica real.

Los roles USUARIO, GESTOR y ADMIN están representados, pero **no hay login ni autorización implementados**. Los índices y enums tampoco comprueban automáticamente horarios, permisos, cambios de estado o solapamientos. El campo activo no significa disponible. Las operaciones de escritura deberán validar las reglas en servidor cuando se desarrollen.

## Cambiar el esquema en equipo

Los pasos siguientes se realizan en vuestra base local. Aunque los datos sean independientes, el esquema es común: no creéis migraciones distintas para resolver el mismo cambio. Acordad quién prepara cada migración y compartidla mediante el PR.

1. Acordad qué modelo o campo se necesita y quién coordina ese cambio. Los tres equipos comparten `schema.prisma`; avisad si dos tareas lo modifican.
2. Actualizad el esquema en la rama de la issue y ejecutad `pnpm run db:validate`.
3. Cread la migración en vuestra base local: `pnpm run db:migrate --name nombre_descriptivo`.
4. Ejecutad `pnpm run db:generate` y probad las consultas que cambian.
5. Incluid **esquema y carpeta de migración** en el mismo PR. No incluyáis `.env` ni el cliente generado.
6. Tras integrar ese PR, el resto actualiza `main` y ejecuta `pnpm run db:deploy` y `pnpm run db:generate`.

`db:migrate` desarrolla una migración nueva; `db:deploy` aplica migraciones existentes. Las migraciones revisadas no se reescriben: un cambio posterior tendrá otra migración. No usaremos `db push` como sustituto del historial común. Si Prisma propone reiniciar una base, deteneos y consultad al profesor antes de aceptar el borrado.

## Datos de prueba

Podéis cargar los datos ficticios en vuestra base local. Si queréis cambiar el archivo de seed que comparten todos los equipos, coordinadlo y revisad el cambio mediante PR.

Después de actualizar el repo, ejecutad `pnpm run db:deploy` y `pnpm run db:generate`; después `pnpm run db:seed` carga los ejemplos del modelo completo. En una base vacía crea 8 usuarios, 5 centros, 7 espacios, 20 tramos de apertura, 5 cierres, 12 reservas, 5 actividades y 8 sesiones. Los casos y fechas están en [Datos de ejemplo](DATOS_DE_EJEMPLO.md).

El seed es explícito: ni `pnpm install --frozen-lockfile` ni `db:deploy` lo ejecutan. Reutiliza el centro y espacios del seed anterior, no borra datos y no actualiza registros ya existentes. Se puede repetir sin duplicar sus claves de ejemplo ni deshacer vuestras ediciones; no es un comando de restauración. Si faltan padres o hay conflictos de claves después de modificaciones manuales, puede detenerse y revertir su transacción: consultad antes de borrar nada.

Solo permite conexiones locales (localhost, 127.0.0.1, ::1 o el servicio Docker postgres) y rechaza NODE_ENV=production. No cambiéis esas protecciones para cargar datos en una base compartida. Los usuarios ficticios no tienen contraseña ni permiten iniciar sesión.

`pnpm run db:check` hace una consulta de conexión y lista centros y número de espacios. Una lista vacía es correcta si no ejecutasteis el seed. Este comando comprueba infraestructura, no el funcionamiento futuro de reservas.

`pnpm run db:check --seeded` es una comprobación de **CI sobre una base vacía recién poblada**: exige las cantidades y ejemplos originales y verifica estados, relaciones y ausencia de ocupaciones confirmadas incompatibles en ese conjunto. No se usa para juzgar una base de alumno con ejemplos editados o registros propios. No implementa las reglas de negocio de la aplicación.

## Qué se sube al repositorio

Sí se suben `schema.prisma`, `prisma.config.ts`, las migraciones, el seed y `.env.example` sin secretos. No se suben `.env`, los datos del volumen Docker ni `src/generated/prisma`. Prisma Studio modifica vuestra base local, no el esquema ni la base de los compañeros.

## Más adelante: base alojada

El profesor proporcionará las instrucciones cuando corresponda. No cambiéis la conexión ahora. En ese momento se indicará qué base utilizaréis, cómo acceder y quién puede aplicar migraciones o cargar datos. No ejecutéis reinicios ni migraciones de desarrollo sobre una base compartida sin autorización.
