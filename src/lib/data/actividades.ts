import "server-only";
import { getPrisma } from "@/lib/prisma";

export type SituacionActividad = "TODAS" | "ACTIVAS" | "INACTIVAS";

// Get activities and their sessions, optionally filtering by activity status.
export async function obtenerActividadesConSesiones(
  situacion: SituacionActividad = "TODAS",
) {
  return getPrisma().actividad.findMany({
    // TODAS: no status condition.
    // ACTIVAS: activo = true.
    // INACTIVAS: activo = false.
    where: situacion === "TODAS" ? {} : { activo: situacion === "ACTIVAS" },
    orderBy: {
      nombre: "asc",
    },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      activo: true,
      sesiones: {
        orderBy: {
          inicio: "asc",
        },
        select: {
          id: true,
          inicio: true,
          fin: true,
          estado: true,
          espacio: {
            select: {
              id: true,
              nombre: true,
              centro: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
