"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  conflictoUnicidad,
  insertarCentro,
  CentroDuplicadoError,
} from "@/lib/mutations/centros";

export async function crearCentro(formulario: FormData): Promise<void> {
  const nombreRecibido = formulario.getAll("nombre");
  if (nombreRecibido.length !== 1 || typeof nombreRecibido[0] !== "string") {
    redirect("/centros/nuevo?error=datos");
  }

  const nombreCentro = nombreRecibido[0].trim();
  if (nombreCentro.length == 0 || nombreCentro.length > 80) {
    redirect("/centros/nuevo?error=datos");
  }

  let fallo: "duplicado" | "guardado" | null = null;
  try {
    await insertarCentro(nombreCentro);
  } catch (error) {
    fallo =
      conflictoUnicidad(error) || error instanceof CentroDuplicadoError
        ? "duplicado"
        : "guardado";
  }
  if (fallo) {
    redirect(`/centros/nuevo?error=${fallo}`);
  }

  revalidatePath("/centros");
  redirect("/centros?resultado=creado");
}
