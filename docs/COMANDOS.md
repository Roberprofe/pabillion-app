# Comandos del proyecto

No necesitáis aprender todos los comandos el primer día. Ejecutadlos desde la carpeta del repo.

## Para empezar

- `pnpm install --frozen-lockfile`: instalar las dependencias acordadas.
- `pnpm run db:up` y `pnpm run db:down`: arrancar y detener vuestra base.
- `pnpm run db:deploy`: aplicar las migraciones existentes.
- `pnpm run db:check`: comprobar conexión y consultas; funciona sin seed.
- `pnpm run dev`: arrancar la app.
- `pnpm run check`: comprobar el código antes de enviar un PR.

## Cuando una tarea lo requiera

| Comando | Resultado |
|---|---|
| `pnpm run dev` | Servidor local para trabajar. |
| `pnpm run lint` | Comprueba reglas de código. |
| `pnpm run typecheck` | Comprueba tipos y rutas. |
| `pnpm run build` | Genera Prisma Client y compila la aplicación. |
| `pnpm run check` | Lint, tipos y compilación juntos. |
| `pnpm run start` | Ejecuta la compilación existente. |
| `pnpm run db:up` | Arranca PostgreSQL local y espera a que esté listo. |
| `pnpm run db:down` | Detiene el servicio local, conservando el volumen de datos. |
| `pnpm run db:generate` | Regenera el cliente tras cambiar el esquema. |
| `pnpm run db:validate` | Valida el esquema Prisma. |
| `pnpm run db:migrate --name nombre_del_cambio` | Crea y aplica una migración de desarrollo. |
| `pnpm run db:deploy` | Aplica las migraciones que ya están en el repositorio. |
| `pnpm run db:seed` | Añade los datos ficticios de ejemplo. |
| `pnpm run db:check` | Comprueba conexión y consulta de los modelos. |
| `pnpm run db:studio` | Abre una herramienta local para inspeccionar los datos. |
| `pnpm run ui:add button` | Incorpora un componente oficial de shadcn/ui. |

Crear una migración, añadir dependencias o incorporar componentes no son pasos de la instalación inicial. Se acuerdan con el equipo y el profesor. La [guía de la base](BASE_DE_DATOS.md) explica las migraciones.

## Dependencias y componentes

Usamos únicamente pnpm. `pnpm-lock.yaml` se sube a Git y no se edita a mano. Si el profesor autoriza una dependencia, utilizad `pnpm add nombre` (o `pnpm add -D nombre` para herramientas) y revisad `package.json` y el lockfile.

`pnpm-workspace.yaml` permite los scripts de instalación de Prisma, esbuild, sharp y el resolvedor de ESLint. No implica que existan varias apps.

Si la instalación congelada detecta diferencias, revisad los archivos; no borréis el lockfile para ocultarlas. Los componentes shadcn ya están instalados: no ejecutéis `shadcn init` ni reinstaléis todo el catálogo al clonar.

## Qué comprueba GitHub

En los PR y al actualizar `main`, el workflow prepara un PostgreSQL temporal, valida el esquema, aplica las migraciones, ejecuta dos veces el seed y comprueba los datos de ejemplo con `pnpm run db:check --seeded`. También ejecuta lint, tipos y compilación.

Esa base es exclusiva de la comprobación: no usa los datos de vuestros ordenadores. No sustituye las pruebas de los criterios de aceptación ni comprueba todavía funciones de reservas o actividades.

## Seguridad

`pnpm audit` permite revisar avisos de dependencias. Si aparecen, comunicadlos al profesor; no apliquéis correcciones forzadas por vuestra cuenta. Hay avisos conocidos pendientes de resolver: que `pnpm run check` pase no significa que la auditoría esté limpia.

