# PostgreSQL y Prisma 7

En este repositorio, PostgreSQL guarda los datos; Prisma define modelos y ofrece consultas tipadas; `@prisma/adapter-pg` conecta Prisma con el controlador PostgreSQL. Son tres piezas del mismo recorrido.

## Primera instalación

Por ahora, cada alumno utiliza una base local independiente. No necesitáis una cuenta ni una conexión remota del profesor. Todos trabajáis con el mismo esquema y las mismas migraciones, pero cada ordenador conserva sus propios datos de prueba.

En la raíz del repo, copiad `.env.example` a `.env` y seguid los comandos del README. `compose.yaml` ofrece PostgreSQL 17 en `localhost:5433`, con una base `gestion_deportiva` y credenciales ficticias para desarrollo local. El volumen conserva los datos al ejecutar `pnpm run db:down`. No uséis `docker compose down -v` para apagarlo: esa opción eliminaría el volumen y sus datos.

Utilizad la configuración Docker incluida para seguir el mismo procedimiento. Si ya tenéis PostgreSQL instalado localmente, consultad al profesor antes de cambiar la conexión: debe ser una base exclusiva de desarrollo, no una base con otros trabajos.

## Qué cambia con Prisma 7

La URL de las herramientas Prisma está en `prisma.config.ts`, no en el bloque `datasource` de `schema.prisma`. El generador es `prisma-client`, con salida explícita `src/generated/prisma`. Para importar el cliente se usa su archivo `client`, y al crearlo se pasa el adaptador `PrismaPg`. Encontraréis ejemplos antiguos con una configuración distinta: comparad siempre su versión con la de este repo.

## Modelo inicial

El esquema contiene únicamente **Centro → Espacio**. Un centro puede tener varios espacios; un espacio pertenece a un centro. Los identificadores los genera Prisma. La combinación centro/nombre de espacio es única, de modo que no se duplica el mismo nombre dentro del mismo centro. La eliminación de un centro con espacios se restringe para evitar una pérdida accidental de la relación.

Es una relación pequeña para comprobar la infraestructura. No representa todavía el modelo final. Los horarios, cierres, reservas, sesiones y permisos se diseñarán con las issues de los equipos. El campo `activo` no implementa por sí solo reglas de disponibilidad.

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

`pnpm run db:seed` añade un centro y dos espacios ficticios con operaciones que evitan duplicarlos si se repite. Es un comando explícito: ni `pnpm install --frozen-lockfile` ni `db:deploy` lo ejecutan. Usad los mismos ejemplos para discutir reglas, pero recordad que las bases de cada ordenador son independientes.

`pnpm run db:check` hace una consulta de conexión y lista centros y número de espacios. Una lista vacía es correcta si no ejecutasteis el seed. Este comando comprueba infraestructura, no el funcionamiento futuro de reservas.

## Qué se sube al repositorio

Sí se suben `schema.prisma`, `prisma.config.ts`, las migraciones, el seed y `.env.example` sin secretos. No se suben `.env`, los datos del volumen Docker ni `src/generated/prisma`. Prisma Studio modifica vuestra base local, no el esquema ni la base de los compañeros.

## Más adelante: base alojada

El profesor proporcionará las instrucciones cuando corresponda. No cambiéis la conexión ahora. En ese momento se indicará qué base utilizaréis, cómo acceder y quién puede aplicar migraciones o cargar datos. No ejecutéis reinicios ni migraciones de desarrollo sobre una base compartida sin autorización.
