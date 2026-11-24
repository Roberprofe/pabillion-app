"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  EspacioNoValidoError,
  insertarSolicitudPendiente,
  SolicitanteNoValidoError,
} from "@/lib/mutations/reservas";

// Un único texto no vacío por campo. Rechaza campos ausentes, repetidos,
// vacíos o enviados como archivo.
function leerCampo(formData: FormData, nombre: string): string | null {
  const valores = formData.getAll(nombre);
  if (valores.length !== 1) return null;

  const valor = valores[0];
  if (typeof valor !== "string") return null;

  const texto = valor.trim();
  if (texto.length === 0 || texto.length > 100) return null;
  return texto;
}

// Instante ISO 8601 con zona explícita (Z o ±HH:MM), por ejemplo
// 2026-12-01T09:00:00.000Z, que es lo que envía el formulario.
// Sin zona se rechaza: el servidor no adivina el desplazamiento.
const FORMATO_ISO_CON_ZONA =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function leerInstante(texto: string): Date | null {
  const partes = FORMATO_ISO_CON_ZONA.exec(texto);
  if (!partes) return null;

  const [, anio, mes, dia, hora, minuto, segundo = "0"] = partes;
  // Rechaza fechas imposibles (30 de febrero, 25:00...) en vez de dejar que
  // Date las desplace al día siguiente.
  const calendario = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
  if (
    calendario.getUTCFullYear() !== Number(anio) ||
    calendario.getUTCMonth() !== Number(mes) - 1 ||
    calendario.getUTCDate() !== Number(dia) ||
    Number(hora) > 23 ||
    Number(minuto) > 59 ||
    Number(segundo) > 59
  ) {
    return null;
  }

  const instante = new Date(texto);
  return Number.isNaN(instante.getTime()) ? null : instante;
}

export async function crearSolicitud(formData: FormData): Promise<void> {
  // Solo se leen estos cuatro campos. Estado, responsable o resolución que
  // envíe el navegador se ignoran: PENDIENTE lo fija el servidor.
  const solicitanteId = leerCampo(formData, "solicitanteId");
  const espacioId = leerCampo(formData, "espacioId");
  const inicioTexto = leerCampo(formData, "inicio");
  const finTexto = leerCampo(formData, "fin");

  if (!solicitanteId || !espacioId || !inicioTexto || !finTexto) {
    redirect("/reservas/nueva?error=campos");
  }

  const inicio = leerInstante(inicioTexto);
  const fin = leerInstante(finTexto);
  if (!inicio || !fin) {
    redirect("/reservas/nueva?error=fecha");
  }

  if (inicio.getTime() <= Date.now()) {
    redirect("/reservas/nueva?error=pasado");
  }

  if (fin.getTime() <= inicio.getTime()) {
    redirect("/reservas/nueva?error=orden");
  }

  let fallo: "solicitante" | "espacio" | "guardar" | null = null;
  let idCreada = "";

  try {
    const creada = await insertarSolicitudPendiente({ solicitanteId, espacioId, inicio, fin });
    idCreada = creada.id;
  } catch (error) {
    if (error instanceof SolicitanteNoValidoError) {
      fallo = "solicitante";
    } else if (error instanceof EspacioNoValidoError) {
      fallo = "espacio";
    } else {
      // No se muestran detalles internos; se dejan en el registro del servidor.
      console.error("Error al registrar la solicitud:", error);
      fallo = "guardar";
    }
  }

  if (fallo) {
    redirect(`/reservas/nueva?error=${fallo}`);
  }

  revalidatePath("/reservas");
  // La página solo confirma si encuentra esa solicitud PENDIENTE en la base.
  redirect(`/reservas?estado=PENDIENTE&creada=${encodeURIComponent(idCreada)}`);
}
