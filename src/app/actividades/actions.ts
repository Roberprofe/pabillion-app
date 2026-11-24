"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insertarActividad } from "@/lib/mutations/actividades";

const NOMBRE_MAX = 80;
const DESCRIPCION_MAX = 500;

// TODO (antes de exponer): verificar identidad y permisos de gestión en servidor.
export async function crearActividad(formulario: FormData): Promise<void> {
  const nombres = formulario.getAll("nombre");
  const descripciones = formulario.getAll("descripcion");

  // Un único texto por campo; la descripción puede faltar. Un File o un
  // valor repetido se rechaza sin convertirlo con String().
  if (
    nombres.length !== 1 ||
    typeof nombres[0] !== "string" ||
    descripciones.length > 1 ||
    (descripciones.length === 1 && typeof descripciones[0] !== "string")
  ) {
    redirect("/actividades/nueva?error=datos");
  }

  const nombre = nombres[0].trim();
  const descripcion =
    descripciones.length === 1 ? (descripciones[0] as string).trim() : "";

  if (
    nombre.length < 1 ||
    nombre.length > NOMBRE_MAX ||
    descripcion.length > DESCRIPCION_MAX
  ) {
    redirect("/actividades/nueva?error=datos");
  }

  let fallo = false;
  try {
    await insertarActividad({ nombre, descripcion: descripcion || null });
  } catch (error) {
    // Diagnóstico interno sin datos del usuario ni secretos en la URL.
    console.error("crearActividad: fallo al guardar", error);
    fallo = true;
  }

  // redirect fuera del try/catch: usa una excepción de control de Next.
  if (fallo) redirect("/actividades/nueva?error=guardado");

  revalidatePath("/actividades");
  redirect("/actividades?resultado=creado");
}