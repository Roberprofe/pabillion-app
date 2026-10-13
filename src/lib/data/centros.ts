import "server-only";

import { getPrisma } from "@/lib/prisma";

export async function obtenerCentrosConEspacios() {
  // Una consulta de relación: no hacemos una consulta por cada centro en un bucle.
  return getPrisma().centro.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      espacios: {
        orderBy: { nombre: "asc" },
        select: { id: true, nombre: true, activo: true },
      },
    },
  });
}
