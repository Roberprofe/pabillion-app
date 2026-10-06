# Entender el repositorio

Empezad por ejecutar la app siguiendo el README. Después abrid estos archivos con VS Code y comparad lo que veis en el navegador con lo que contiene cada uno.

## Stack y decisiones

| Herramienta | Versión inicial | Para qué se utiliza |
|---|---|---|
| Next.js | 16.3.8 | Páginas y lógica de servidor, con App Router. |
| React | 19.2.8 | Componentes de interfaz. |
| TypeScript | Versión fijada en el lockfile | JavaScript con comprobación de tipos. |
| Tailwind CSS | 4 | Estilos utilizados por shadcn/ui. |
| shadcn CLI | 4.21.3 | Añadir componentes como código del repositorio. |
| Prisma y adaptador PostgreSQL | 7.10.0 | Acceso tipado a la base de datos. |
| PostgreSQL local | 17 | Servicio de datos de desarrollo, mediante Docker. |

Next.js y shadcn se inicializaron con las últimas versiones estables del registro npm comprobadas el 6 de octubre de 2026. Prisma permanece en la versión mayor 7 solicitada. El `pnpm-lock.yaml` fija lo instalado: usad `pnpm install --frozen-lockfile` y no actualicéis dependencias por vuestra cuenta. shadcn no tiene una sola versión de todos sus componentes: su CLI incorpora archivos a `src/components/ui` y registra las dependencias necesarias.

## Mapa de carpetas

```text
src/
  app/
    layout.tsx         Estructura común, idioma y navegación.
    page.tsx           Portada: ruta /.
    globals.css        Tema y estilos comunes de Tailwind y shadcn.
    centros/page.tsx   Punto de partida del equipo A.
    reservas/page.tsx  Punto de partida del equipo B.
    actividades/page.tsx  Punto de partida del equipo C.
  components/
    ui/                Componentes incorporados desde shadcn.
    module-placeholder.tsx  Mensaje compartido de módulo por desarrollar.
  lib/
    utils.ts           Utilidad de estilos que genera shadcn.
    prisma.ts          Cliente Prisma de servidor con adaptador PostgreSQL.
  generated/prisma/    Cliente generado; no se edita ni se sube a Git.
prisma/
  schema.prisma        Modelos compartidos de la base.
  migrations/          Historial SQL versionado de cambios del esquema.
  seed.ts              Datos ficticios opcionales para desarrollo.
scripts/check-db.ts    Comprueba la conexión y una consulta Prisma.
docs/                 Guías para comprender y desarrollar la app.
compose.yaml          Servicio PostgreSQL local.
prisma.config.ts      Configuración de la CLI Prisma 7.
components.json       Opciones y rutas utilizadas por shadcn.
package.json          Dependencias y comandos pnpm.
pnpm-workspace.yaml  Permisos de scripts de instalación de dependencias.
pnpm-lock.yaml        Versiones exactas instaladas para toda la clase.
```

## Cómo se convierte una carpeta en una página

Con App Router, `src/app/centros/page.tsx` se muestra en `/centros`. `src/app/layout.tsx` envuelve las páginas con la estructura compartida. Para la primera tarea de A, se empezará por la página de centros; B y C trabajarán en sus propias rutas. El profesor asigna la función concreta: que la carpeta exista no significa que ya se pueda crear cualquier pantalla.

Los archivos terminados en `.tsx` combinan TypeScript y JSX, la sintaxis que describe componentes React. `@/` apunta a `src/`: `@/components/ui/card` significa `src/components/ui/card.tsx`. Un componente devuelve el contenido que se muestra. Los datos y las reglas del producto seguirán los acuerdos del encargo, aunque los archivos utilicen nombres técnicos.

## Servidor y navegador

Las páginas del App Router son componentes de servidor por defecto. Allí se puede consultar Prisma sin enviar la conexión al navegador. Un componente que necesite estado, efectos o eventos del usuario lleva `"use client"` al principio. No añadáis esa línea a todas las páginas por costumbre: un componente de navegador no debe importar `src/lib/prisma.ts`.

Cuando llegue la primera consulta real, una página de servidor podrá importar `getPrisma` y usarla, por ejemplo:

```tsx
import { getPrisma } from "@/lib/prisma";

// Dentro de una función async de servidor:
const centros = await getPrisma().centro.findMany();
```

La página actual de centros sigue vacía: el ejemplo anterior explica dónde se situará la consulta, no la implementa. Para guardar información con formularios se definirán acciones de servidor o rutas de servidor y sus validaciones. Tanto los permisos como las reglas de horarios y ocupación deben comprobarse en el servidor.

## Por qué existe `getPrisma()`

Prisma Client se genera a partir del esquema. `PrismaPg` conecta ese cliente con PostgreSQL. `getPrisma()` crea una instancia cuando se necesita y la reutiliza durante el desarrollo para no abrir un cliente nuevo en cada recarga. El archivo incluye `server-only` para impedir que se use accidentalmente desde un componente de navegador. La conexión se configura con `DATABASE_URL` de `.env`.

Las páginas iniciales no llaman a `getPrisma()`: se pueden abrir sin PostgreSQL. Cuando una página consulte datos, necesitará la base arrancada y las migraciones aplicadas.

## Cómo utilizamos shadcn/ui

El catálogo completo instalado contiene 61 archivos en `src/components/ui`, además de `src/hooks/use-mobile.ts`. Usa el preset `b27GdPXs` (Rhea, Radix, tema neutro, Tabler e Inter). No hay que volver a instalarlos al clonar el repo.

El hook `use-mobile` y el carrusel tienen ajustes locales con `useSyncExternalStore` para cumplir las reglas de React sin desactivar lint. El carrusel elimina sus dos suscripciones al desmontarse. Si reinstaláis los componentes, revisad estos ajustes. No necesitáis estudiar todo el catálogo: empezad por los componentes que pida vuestra tarea.

`layout.tsx` incluye `TooltipProvider` y el `Toaster` de Sonner: podéis usar tooltips y enviar notificaciones desde componentes de navegador mediante `toast` de `sonner`. El Toaster está configurado en modo claro, igual que la app inicial. No existe todavía un selector de tema. Inter se prepara con `next/font/google`; la primera compilación necesita acceso a Google Fonts y después la app sirve la fuente por sí misma.

shadcn incorpora componentes como archivos propios en `src/components/ui`; podéis leerlos y entenderlos. Antes de hacer un botón nuevo, comprobad si `Button` ya existe. Para incorporar otro componente, acordad el cambio con el equipo y ejecutad `pnpm run ui:add nombre`. Revisad los archivos y el lockfile que modifica antes de hacer commit. La versión de la CLI está fijada en este proyecto.

Los componentes de producto que reutilicen varias páginas irán en `src/components`; los exclusivos de un equipo pueden colocarse en una subcarpeta con un nombre comprensible. `layout.tsx`, `globals.css`, `schema.prisma` y la configuración son compartidos: avisad antes de cambiarlos.

## Por dónde empezar cada equipo

| Equipo | Punto de partida | Qué debe consultar antes |
|---|---|---|
| A | `src/app/centros/page.tsx` | Qué significa centro, espacio y cierre. |
| B | `src/app/reservas/page.tsx` | Identificadores de espacios y significado de estados. |
| C | `src/app/actividades/page.tsx` | Diferencia entre actividad y sesión, y sus ocupaciones. |

No se crea un frontend distinto ni se divide el modelo de datos por equipos. Las bases de desarrollo pueden ser independientes, pero comparten el mismo esquema y las mismas migraciones. La persistencia, los identificadores y las reglas comunes se coordinan entre los tres. Ninguno de los archivos iniciales resuelve todavía una issue funcional del alumnado.
