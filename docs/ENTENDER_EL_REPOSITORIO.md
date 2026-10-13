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
    ejemplo-fetching/   Página de referencia con carga y error propios.
  components/
    ui/                Componentes incorporados desde shadcn.
    module-placeholder.tsx  Mensaje compartido de módulo por desarrollar.
  lib/
    utils.ts           Utilidad de estilos que genera shadcn.
    prisma.ts          Cliente Prisma de servidor con adaptador PostgreSQL.
    data/centros.ts    Lectura compartida de centros y espacios, solo servidor.
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

Para una lectura reutilizable, la página de servidor importa la función de `lib/data`, por ejemplo:

```tsx
import { obtenerCentrosConEspacios } from "@/lib/data/centros";

// Dentro de una función async de servidor:
const centros = await obtenerCentrosConEspacios();
```

La página del equipo A sigue siendo su punto de partida; `/ejemplo-fetching` ya utiliza esa consulta. Para guardar información con formularios se definirán acciones de servidor con sus validaciones. Tanto los permisos como las reglas de horarios y ocupación deben comprobarse en el servidor.

## Dónde colocar consultas y acciones

Next.js permite colocar archivos auxiliares junto a una página o fuera de `app`. No hay una carpeta `data` obligatoria ni `actions.ts` es un archivo especial de rutas. Para este proyecto adoptamos una convención sencilla:

| Tipo de código | Dónde lo ponemos | Qué hace |
|---|---|---|
| Página y estados de interfaz | `src/app/nombre-del-modulo/page.tsx`, `loading.tsx`, `error.tsx` | Presentar datos, carga y errores. |
| Consulta reutilizable | `src/lib/data/centros.ts`, futuros `espacios.ts`, etc. | Leer con Prisma; devuelve los campos necesarios, no JSX. Lleva `import "server-only"`. |
| Acción de formulario | Futuro `src/app/centros/actions.ts`, `reservas/actions.ts`, etc. | Crear, modificar o eliminar desde la interfaz. Lleva `"use server"`. |
| Cliente de base de datos | `src/lib/prisma.ts` | Configurar y reutilizar Prisma; no mezclar aquí las consultas del producto. |
| Componente reutilizable | `src/components/...` | Interfaz compartida. No importa Prisma si lleva `"use client"`. |

Solo `lib/data/centros.ts` existe actualmente como capa de consultas. Los otros archivos de datos y acciones se crearán al implementar sus tareas, no como carpetas vacías anticipadas. Si una función es exclusiva de una ruta, colocarla allí también es válido; no duplicamos una lectura común en cada equipo.

### Leer: función de servidor, no Server Action

La página llama directamente a `obtenerCentrosConEspacios()`. Esa función utiliza `getPrisma()` y devuelve datos tipados. No necesita `"use server"`, una ruta API ni `fetch` hacia nuestra propia aplicación. `server-only` impide que se importe accidentalmente desde código cliente: no crea un endpoint.

`connection()` sigue en la página porque decide cuándo se renderiza la ruta. No lo añadimos por costumbre a cada consulta reutilizable. Esta lectura no hace escrituras ni convierte fallos de conexión en listas vacías.

Al consultar, seleccionamos los campos utilizados, aplicamos filtros y orden explícitos y traemos relaciones sin consultar cada fila en un bucle. No creamos un nuevo cliente Prisma ni lo desconectamos al terminar cada petición.

### Escribir: acción de servidor del módulo

Cuando una tarea encargue guardar un formulario, su función irá en el `actions.ts` de ese módulo. Una acción debe:

1. Comprobar identidad y permiso para esa operación cuando exista autenticación; esconder un botón no protege la acción.
2. Validar los datos recibidos y las reglas del producto en servidor.
3. Ejecutar la escritura con Prisma; usar transacción si varias escrituras deben completarse juntas.
4. Devolver errores de validación comprensibles sin exponer detalles internos.
5. Actualizar la interfaz o invalidar los datos pertinentes, por ejemplo mediante `revalidatePath`, según el caso.

Las funciones con `"use server"` pueden invocarse mediante peticiones POST directas: no se consideran privadas por estar en una carpeta determinada. Si la lógica de escritura empieza a compartirse entre acciones o rutas, se extraerá a una función interna `server-only` por dominio; no añadimos esa capa antes de necesitarla.

Si necesitamos una API para otro cliente, se utilizará `src/app/api/.../route.ts` con validación y permisos propios. No creamos APIs solamente para que una página de servidor consulte PostgreSQL. `route.ts` y `page.tsx` no se colocan en el mismo segmento para servir la misma ruta.

Referencias: [organización de proyectos](https://nextjs.org/docs/app/getting-started/project-structure), [lectura de datos](https://nextjs.org/docs/app/getting-started/fetching-data), [acciones y escrituras](https://nextjs.org/docs/app/getting-started/mutating-data).

## Por qué existe `getPrisma()`

Prisma Client se genera a partir del esquema. `PrismaPg` conecta ese cliente con PostgreSQL. `getPrisma()` crea una instancia cuando se necesita y la reutiliza durante el desarrollo para no abrir un cliente nuevo en cada recarga. El archivo incluye `server-only` para impedir que se use accidentalmente desde un componente de navegador. La conexión se configura con `DATABASE_URL` de `.env`.

Los módulos iniciales se pueden abrir sin PostgreSQL. El ejemplo de fetching sí consulta datos mediante `lib/data/centros.ts`: necesita la base arrancada y las migraciones aplicadas.

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
