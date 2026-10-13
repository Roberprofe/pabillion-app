# Ejemplo de lectura de datos

Abre `/ejemplo-fetching` o el enlace **Ejemplo de datos** de la navegación. Es una referencia independiente: no sustituye las entregas de centros, reservas o actividades.

## Qué leer y en qué orden

1. [page.tsx](../src/app/ejemplo-fetching/page.tsx): componente de servidor. Espera una petición con `connection()`, consulta y representa los resultados.
2. [lib/data/centros.ts](../src/lib/data/centros.ts): consulta reutilizable `findMany` con `select` de los campos necesarios y de los espacios relacionados, ordenados por nombre. `server-only` evita importar este archivo desde un componente cliente. No es una Server Action: se llama directamente desde servidor, sin `use server` ni una petición HTTP intermedia.
3. [loading.tsx](../src/app/ejemplo-fetching/loading.tsx): muestra un estado de carga mientras Next.js espera la lectura, sin retrasos artificiales.
4. [error.tsx](../src/app/ejemplo-fetching/error.tsx): componente cliente solo para el botón de recuperación. En Next.js 16.3, `retry()` vuelve a pedir el contenido al servidor; no importa Prisma ni muestra el error interno.

Se reutiliza `getPrisma()` y el adaptador PostgreSQL del repo. No hay una API intermedia ni una consulta por cada centro en un bucle. Una consulta de relación de Prisma no implica necesariamente una sola sentencia SQL.

Las lecturas compartidas van en `src/lib/data`, agrupadas por concepto del producto. Las futuras acciones de formularios irán en `actions.ts` junto a su módulo; todavía no hay acciones de escritura. Consulta [dónde colocar cada función](ENTENDER_EL_REPOSITORIO.md#dónde-colocar-consultas-y-acciones) antes de añadir una.

La consulta puede devolver cero centros o centros sin espacios: ambos tienen mensajes propios. Un fallo de conexión se propaga a `error.tsx`, no se convierte en una lista vacía. Activo/inactivo no representa disponibilidad por fecha y hora.

## Cómo comprobarlo

Con el entorno preparado según el README:

- Carga datos locales con `pnpm run db:seed` y abre la página.
- En `pnpm run db:studio`, cambia un nombre ficticio, guarda y recarga: debe cambiar en la página.
- Crea un centro ficticio sin espacios para comprobar su mensaje.
- Cambia temporalmente un espacio a inactivo y verifica su etiqueta; restaura los cambios después.
- Solo si la base está inicialmente vacía, comprueba el mensaje sin centros. No borres datos para preparar esta prueba.
- Para probar el error, detén únicamente la base local de este proyecto con `pnpm run db:down`, recarga, vuelve a arrancarla y pulsa **Volver a intentar**. No lo hagas si alguien está usando esa base.

No añadas `use client` a la página ni publiques `.env`. Este ejemplo está pensado para pocos registros de clase: un listado grande requerirá paginación. No incluye autenticación ni permisos y no es un módulo completo listo para producción.
