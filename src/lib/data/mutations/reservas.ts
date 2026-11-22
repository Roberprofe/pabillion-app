
import "server-only";

import { getPrisma } from "@/lib/prisma";

type DatosSolicitud = {
  solicitanteId: string;
  espacioId: string;
  inicio: string;
  fin: string;
};

export async function crearSolicitudReserva(datos: DatosSolicitud) {
  const prisma = getPrisma();

  // Comprobamos que el usuario exista y esté activo.
  const solicitante = await prisma.usuario.findUnique({
    where: {
      id: datos.solicitanteId,
      activo: true,
    },
    select: {
      id: true,
    },
  });

  if (!solicitante) {
    throw new Error("SOLICITANTE_INVALIDO");
  }

  // Comprobamos que el espacio exista, esté activo
  // y pertenezca a un centro activo.
  const espacio = await prisma.espacio.findFirst({
    where: {
      id: datos.espacioId,
      activo: true,
      centro: {
        activo: true,
      },
    },
    select: {
      id: true,
    },
  });

  if (!espacio) {
    throw new Error("ESPACIO_INVALIDO");
  }

  // Guardamos la solicitud.
  return prisma.reserva.create({
    data: {
      solicitanteId: solicitante.id,
      espacioId: espacio.id,
      inicio: new Date(datos.inicio),
      fin: new Date(datos.fin),

      // El estado se establece en el servidor.
      estado: "PENDIENTE",

      // No ha sido resuelta todavía.
      resueltaPorId: null,
      resueltaEn: null,
      motivoResolucion: null,
    },
    select: {
      id: true,
      estado: true,
    },
  });
}
