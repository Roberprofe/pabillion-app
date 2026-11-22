
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { crearSolicitudReserva } from "@/lib/data/mutations/reservas";
function obtenerCampo(formData: FormData, nombre: string) {
  const valores = formData.getAll(nombre);

  // Cada campo debe aparecer exactamente una vez.
  if (valores.length !== 1) {
    return null;
  }

  const valor = valores[0];

  // No aceptamos archivos ni otros tipos de datos.
  if (typeof valor !== "string") {
    return null;
  }

  const texto = valor.trim();

  if (texto.length === 0) {
    return null;
  }

  return texto;
}

function fechaValida(valor: string) {
  // Exigimos una fecha ISO con zona horaria.
  const formatoISO =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|[+-]\d{2}:\d{2})$/;

  if (!formatoISO.test(valor)) {
    return false;
  }

  const fecha = new Date(valor);

  return !Number.isNaN(fecha.getTime());
}

export async function registrarSolicitud(formData: FormData) {
  const solicitanteId = obtenerCampo(
    formData,
    "solicitanteId",
  );

  const espacioId = obtenerCampo(
    formData,
    "espacioId",
  );

  const inicio = obtenerCampo(formData, "inicio");
  const fin = obtenerCampo(formData, "fin");

  // Comprobamos que todos los campos estén completos.
  if (!solicitanteId || !espacioId || !inicio || !fin) {
    redirect("/reservas/nueva?error=campos");
  }

  // Validamos el formato de las fechas.
  if (!fechaValida(inicio) || !fechaValida(fin)) {
    redirect("/reservas/nueva?error=fecha");
  }

  const fechaInicio = new Date(inicio);
  const fechaFin = new Date(fin);

  // La fecha de inicio debe ser futura.
  if (fechaInicio.getTime() <= Date.now()) {
    redirect("/reservas/nueva?error=pasado");
  }

  // La fecha de fin debe ser posterior a la de inicio.
  if (fechaFin.getTime() <= fechaInicio.getTime()) {
    redirect("/reservas/nueva?error=orden");
  }

  let errorGuardado = "";

  try {
    await crearSolicitudReserva({
      solicitanteId,
      espacioId,
      inicio,
      fin,
    });
  } catch (error) {
    console.error("Error al registrar solicitud:", error);

    if (error instanceof Error) {
      if (error.message === "SOLICITANTE_INVALIDO") {
        errorGuardado = "solicitante";
      } else if (error.message === "ESPACIO_INVALIDO") {
        errorGuardado = "espacio";
      }
    }

    if (!errorGuardado) {
      errorGuardado = "guardar";
    }
  }

  if (errorGuardado) {
    redirect(`/reservas/nueva?error=${errorGuardado}`);
  }

  revalidatePath("/reservas");

  redirect("/reservas?resultado=creado&estado=PENDIENTE");
}
