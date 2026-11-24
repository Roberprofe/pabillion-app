import Link from "next/link";
import { connection } from "next/server";

import { obtenerOpcionesSolicitud, type OpcionesSolicitud } from "@/lib/data/reservas";
import FormularioSolicitud from "./formulario";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const MENSAJES_ERROR: Record<string, string> = {
  campos: "Completa una sola vez cada campo: solicitante, espacio, inicio y fin.",
  fecha: "Las fechas recibidas no son válidas o no indican zona horaria.",
  pasado: "La fecha de inicio debe ser futura.",
  orden: "La fecha de fin debe ser posterior a la de inicio.",
  solicitante: "El solicitante no existe o no está activo.",
  espacio: "El espacio no existe, no está activo o su centro no está activo.",
  guardar: "No se pudo registrar la solicitud. Inténtalo de nuevo.",
};

export default async function NuevaSolicitudPage({ searchParams }: PageProps) {
  await connection();

  const errorRecibido = (await searchParams).error;
  const error =
    typeof errorRecibido === "string" && Object.hasOwn(MENSAJES_ERROR, errorRecibido)
      ? MENSAJES_ERROR[errorRecibido]
      : undefined;

  let opciones: OpcionesSolicitud;

  try {
    opciones = await obtenerOpcionesSolicitud();
  } catch (e) {
    console.error("Error al cargar el formulario de solicitud:", e);

    return (
      <main className="mx-auto max-w-3xl p-6 md:p-10">
        <h1 className="text-3xl font-bold">Nueva solicitud de reserva</h1>

        <p role="alert" className="mt-4 rounded-lg border border-red-300 p-4 text-red-700">
          No se han podido cargar los usuarios y espacios. Comprueba la conexión con la base de
          datos.
        </p>

        <Link href="/reservas" className="mt-6 inline-block rounded-lg border px-5 py-3">
          Volver a solicitudes y reservas
        </Link>
      </main>
    );
  }

  const { usuarios, espacios } = opciones;

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-600">GESTIÓN DE ESPACIOS</p>

        <h1 className="text-3xl font-bold tracking-tight">Nueva solicitud de reserva</h1>

        <p className="mt-3 text-gray-600">
          Recepción registra la petición de un usuario existente. Elegir a la persona solicitante
          no inicia sesión como ella. La solicitud queda pendiente de revisión: no reserva el
          espacio ni comprueba su disponibilidad.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800"
        >
          {error}
        </div>
      )}

      {usuarios.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          No hay usuarios activos: hace falta al menos uno para registrar una solicitud.
        </div>
      )}

      {espacios.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          No hay espacios activos en centros activos: hace falta al menos uno para registrar una
          solicitud.
        </div>
      )}

      <FormularioSolicitud usuarios={usuarios} espacios={espacios} />

      <Link href="/reservas" className="mt-6 inline-block text-sm text-blue-700 hover:underline">
        ← Volver a solicitudes y reservas
      </Link>
    </main>
  );
}
