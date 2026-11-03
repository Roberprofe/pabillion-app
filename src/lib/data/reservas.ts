import "server-only";

import { getPrisma } from "@/lib/prisma";

// Lectura de reservas con sus relaciones (solicitante, espacio/centro y
// responsable de resolución opcional). Todo se une por IDs de la BD, nunca
// por texto como el nombre. Solo se seleccionan los campos que la pantalla
// necesita: no se trae email ni ningún dato de autenticación.
export async function obtenerReservas() {
  return getPrisma().reserva.findMany({
    // Orden por inicio; el id desempata para que el orden sea estable.
    orderBy: [{ inicio: "asc" }, { id: "asc" }],
    select: {
      id: true,
      inicio: true,
      fin: true,
      estado: true,
      // Estos tres campos son null mientras la reserva no se ha resuelto.
      resueltaEn: true,
      motivoResolucion: true,
      solicitante: {
        select: { id: true, nombre: true },
      },
      espacio: {
        select: {
          id: true,
          nombre: true,
          centro: {
            select: { id: true, nombre: true },
          },
        },
      },
      // Relación opcional: puede ser null (p. ej. una pendiente sin resolver).
      resueltaPor: {
        select: { id: true, nombre: true },
      },
    },
  });
}

export type ReservaListada = Awaited<ReturnType<typeof obtenerReservas>>[number];