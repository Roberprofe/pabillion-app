import "server-only";
import { getPrisma } from "@/lib/prisma";

// Inserta una actividad. Solo se escriben los campos permitidos:
// id, activo y fechas los fijan los defaults del esquema.
export async function insertarActividad(datos: {
  nombre: string;
  descripcion: string | null;
}) {
  return getPrisma().actividad.create({
    data: {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
    },
    select: { id: true },
  });
}