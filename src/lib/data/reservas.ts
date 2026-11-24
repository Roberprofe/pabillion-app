import "server-only";

import type { EstadoReserva } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

// Lectura de reservas con sus relaciones (solicitante, espacio/centro y
// responsable de resolución opcional). Todo se relaciona por IDs, nunca por
// texto. Solo se seleccionan los campos que muestra la pantalla: no se trae
// email ni ningún dato de autenticación.
//
// Sin estado (undefined) devuelve todas las reservas; con un estado ya
// validado por la página, Prisma filtra con where en la base de datos.
export async function obtenerReservas(estado?: EstadoReserva) {
  return getPrisma().reserva.findMany({
    where: estado === undefined ? undefined : { estado },

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
      // Relación opcional: es null en una pendiente sin resolver.
      resueltaPor: {
        select: { id: true, nombre: true },
      },
    },
  });
}

export type ReservaListada = Awaited<ReturnType<typeof obtenerReservas>>[number];

// Opciones del formulario de nueva solicitud (B-06).
// Usuarios activos y espacios activos de centros activos, identificados por
// ID. Del usuario solo se lee id y nombre: ni email ni datos de autenticación.
export async function obtenerOpcionesSolicitud() {
  const prisma = getPrisma();

  const [usuarios, espacios] = await Promise.all([
    prisma.usuario.findMany({
      where: { activo: true },
      orderBy: [{ nombre: "asc" }, { id: "asc" }],
      select: { id: true, nombre: true },
    }),
    prisma.espacio.findMany({
      where: { activo: true, centro: { activo: true } },
      orderBy: [{ centro: { nombre: "asc" } }, { nombre: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nombre: true,
        centro: { select: { id: true, nombre: true } },
      },
    }),
  ]);

  return { usuarios, espacios };
}

export type OpcionesSolicitud = Awaited<ReturnType<typeof obtenerOpcionesSolicitud>>;
