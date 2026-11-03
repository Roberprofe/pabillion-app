import "server-only";
import { getPrisma } from "@/lib/prisma";

// function to get all activities and sessions from db
export async function obtenerActividadesConSesiones() {
  // return all activities with sessions and especio and centro where that session will be

  return getPrisma().actividad.findMany({
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
