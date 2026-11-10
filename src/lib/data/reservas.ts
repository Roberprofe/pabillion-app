
import "server-only";

import { getPrisma } from "@/lib/prisma";

// Estados que puede recibir el filtro.
export type EstadoReservaFiltro =
  | "TODOS"
  | "PENDIENTE"
  | "CONFIRMADA"
  | "RECHAZADA"
  | "CANCELADA";

// Lectura de reservas con sus relaciones.
// Si el estado es TODOS, devuelve todas las reservas.
// Si recibe otro estado, devuelve solamente las de ese estado.
export async function obtenerReservas(estado: EstadoReservaFiltro = "TODOS") {
  return getPrisma().reserva.findMany({
    // Si no se selecciona TODOS, aplicamos el filtro en la base de datos.
    where: estado === "TODOS" ? undefined : { estado },

    // Orden por inicio; el id desempata para que el orden sea estable.
    orderBy: [{ inicio: "asc" }, { id: "asc" }],

    select: {
      id: true,
      inicio: true,
      fin: true,
      estado: true,
      resueltaEn: true,
      motivoResolucion: true,

      solicitante: {
        select: {
          id: true,
          nombre: true,
        },
      },

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

      resueltaPor: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  });
}

export type ReservaListada = Awaited<
  ReturnType<typeof obtenerReservas>
>[number];
