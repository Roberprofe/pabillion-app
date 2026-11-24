import "server-only";

import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export class CentroDuplicadoError extends Error {}

export function conflictoUnicidad(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function insertarCentro(nombre: string) {
  const existe = await getPrisma().centro.findUnique({
    where: { nombre },
    select: { id: true },
  });
  if (existe) {
    throw new CentroDuplicadoError("Ya existe un centro con ese nombre");
  }
  return getPrisma().centro.create({
    data: { nombre },
    select: { id: true },
  });
}
