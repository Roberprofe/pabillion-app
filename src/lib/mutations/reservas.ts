import "server-only";

import { EstadoReserva } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export class SolicitanteNoValidoError extends Error {
  constructor() {
    super("El solicitante no existe o no está activo.");
    this.name = "SolicitanteNoValidoError";
  }
}

export class EspacioNoValidoError extends Error {
  constructor() {
    super("El espacio no existe, no está activo o su centro no está activo.");
    this.name = "EspacioNoValidoError";
  }
}

type DatosSolicitud = {
  solicitanteId: string;
  espacioId: string;
  inicio: Date;
  fin: Date;
};

// Inserta una solicitud de reserva PENDIENTE.
// Recibe datos ya validados por la acción y vuelve a consultar en la base de
// datos que usuario, espacio y centro existen y siguen activos: un ID
// manipulado no se acepta por haber venido de un select.
// El estado y la resolución los fija el servidor; nada de eso llega del
// navegador. Registrar la solicitud no comprueba disponibilidad ni bloquea
// el espacio.
export async function insertarSolicitudPendiente(datos: DatosSolicitud) {
  return getPrisma().$transaction(async (tx) => {
    const solicitante = await tx.usuario.findFirst({
      where: { id: datos.solicitanteId, activo: true },
      select: { id: true },
    });
    if (!solicitante) throw new SolicitanteNoValidoError();

    const espacio = await tx.espacio.findFirst({
      where: { id: datos.espacioId, activo: true, centro: { activo: true } },
      select: { id: true },
    });
    if (!espacio) throw new EspacioNoValidoError();

    return tx.reserva.create({
      data: {
        solicitanteId: solicitante.id,
        espacioId: espacio.id,
        inicio: datos.inicio,
        fin: datos.fin,
        estado: EstadoReserva.PENDIENTE,
        resueltaPorId: null,
        resueltaEn: null,
        motivoResolucion: null,
      },
      select: { id: true },
    });
  });
}
