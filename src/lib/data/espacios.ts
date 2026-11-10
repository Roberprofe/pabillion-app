import "server-only";

import { getPrisma } from "@/lib/prisma";

export async function obtenerEspaciosEnCentro() {
  // Una consulta de relación: no hacemos una consulta por cada centro en un bucle.
  return getPrisma().espacio.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      activo: true,
      centro: {
        select: { id: true, nombre: true },
      },
    },
  });
}

export async function obtenerEspaciosConHorariosCierres(){
    return getPrisma().espacio.findMany({
        orderBy: { nombre: 'asc'},
        select: {
            id: true,
            nombre: true,
            activo: true,
            centro: {
                select: { id: true, nombre: true },
            },
            horarios: {
                select: {id: true, diaSemana: true, inicioMinuto: true, finMinuto:true},
            },
            cierres: {
                select: {id: true, inicio: true, fin: true, motivo:true, activo:true},
            },
        },
    });
}

