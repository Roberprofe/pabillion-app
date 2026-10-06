# Gestión deportiva · Afondamento

Una aplicación común para tres equipos de cinco alumnos. Incluye Next.js, TypeScript, shadcn/ui y Prisma 7. Las funciones de centros, reservas y actividades están por desarrollar.

Cada alumno utiliza su PostgreSQL local. Compartimos código y migraciones, no los datos de cada ordenador.

## Requisitos

Node.js **24 LTS**, pnpm **10.28.1**, Git, VS Code y Docker. En Windows, Docker Desktop debe usar contenedores Linux; en Linux, necesitáis Docker Engine con Compose.

Si falta pnpm: `npm install --global pnpm@10.28.1`.

## Primera instalación

Clonad el repositorio, abrid su carpeta en VS Code y arrancad Docker.

1. Copiad `.env.example` a `.env` **solo si no existe**. Conservad la conexión local incluida.

   Windows (PowerShell):

   ```powershell
   Copy-Item .env.example .env
   ```

   Linux:

   ```bash
   cp .env.example .env
   ```

2. En la terminal integrada, ejecutad:

   ```sh
   pnpm install --frozen-lockfile
   pnpm run db:up
   pnpm run db:deploy
   pnpm run db:check
   pnpm run dev
   ```

3. Abrid `http://localhost:3000`. Las páginas son puntos de partida, no funciones terminadas. La base estará vacía; podéis cargar ejemplos con `pnpm run db:seed`.

## Cada día

Con Docker arrancado: `pnpm run db:up` y `pnpm run dev`. Si llegan migraciones nuevas al actualizar el repo, ejecutad antes `pnpm run db:deploy` y `pnpm run db:generate`.

Al terminar: **Ctrl+C** para detener Next.js y `pnpm run db:down` para detener PostgreSQL sin borrar datos.

## Antes de enviar un PR

Ejecutad `pnpm run check` y probad los criterios de vuestra issue. Si cambiáis la base, comprobad también migraciones y consultas.

No subáis `.env` ni datos reales. No borréis el lockfile, reinstaléis shadcn ni actualicéis dependencias sin acordarlo.

## Si algo falla

- Instalación: comprobad Node 24 y que `.env` existe antes de instalar.
- Conexión: revisad Docker, `db:up` y el puerto local **5433**.
- Tablas inexistentes: ejecutad `db:deploy`. Cliente Prisma inexistente: `db:generate`.
- Puerto 3000 ocupado: detened el servidor anterior o usad el puerto que indique Next.js.

## Guías para trabajar

- [Carpetas, stack y componentes](docs/ENTENDER_EL_REPOSITORIO.md).
- [Base de datos y migraciones](docs/BASE_DE_DATOS.md).
- [Comandos básicos y avanzados](docs/COMANDOS.md).
- [Issues, ramas, revisiones y PRs](CONTRIBUTING.md).
