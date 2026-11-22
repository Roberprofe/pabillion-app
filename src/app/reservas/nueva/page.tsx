
import { connection } from "next/server";
import Link from "next/link";

import { getPrisma } from "@/lib/prisma";
import FormularioSolicitud from "./formulario";

type PageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

const mensajesError: Record<string, string> = {
  campos: "Completa correctamente todos los campos.",
  fecha: "Las fechas recibidas no son válidas.",
  pasado: "La fecha de inicio debe ser futura.",
  orden: "La fecha de fin debe ser posterior al inicio.",
  solicitante: "El solicitante no existe o no está activo.",
  espacio: "El espacio no existe o su centro está inactivo.",
  guardar: "No se pudo registrar la solicitud.",
};

export default async function NuevaReservaPage({
  searchParams,
}: PageProps) {
  await connection();

  const parametros = await searchParams;
  const errorRecibido = parametros.error;

  const error =
    typeof errorRecibido === "string"
      ? mensajesError[errorRecibido]
      : undefined;

  let usuarios;
  let espacios;

  try {
    const prisma = getPrisma();

    // Usuarios activos.
    usuarios = await prisma.usuario.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: "asc",
      },
    });

    // Espacios activos que pertenecen a centros activos.
    espacios = await prisma.espacio.findMany({
      where: {
        activo: true,
        centro: {
          activo: true,
        },
      },
      select: {
        id: true,
        nombre: true,
        centro: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [
        {
          centro: {
            nombre: "asc",
          },
        },
        {
          nombre: "asc",
        },
      ],
    });
  } catch (e) {
    console.error("Error al cargar formulario:", e);

    return (
      <main className="mx-auto max-w-3xl p-6 md:p-10">
        <h1 className="text-3xl font-bold">
          Nueva solicitud
        </h1>

        <p className="mt-4 rounded-lg border border-red-300 p-4 text-red-700">
          No se han podido cargar los usuarios y espacios.
          Comprueba la conexión con la base de datos.
        </p>

        <Link
          href="/reservas"
          className="mt-6 inline-block rounded-lg border px-5 py-3"
        >
          Volver a reservas
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-600">
          GESTIÓN DE ESPACIOS
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Nueva solicitud de reserva
        </h1>

        <p className="mt-3 text-gray-600">
          Registra una solicitud para un usuario y un espacio.
          La solicitud quedará pendiente de revisión.
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
          No hay usuarios activos registrados.
        </div>
      )}

      {espacios.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          No hay espacios activos pertenecientes a centros activos.
        </div>
      )}

      <FormularioSolicitud
        usuarios={usuarios}
        espacios={espacios}
      />

      <Link
        href="/reservas"
        className="mt-6 inline-block text-sm text-blue-700 hover:underline"
      >
        ← Volver a solicitudes y reservas
      </Link>
    </main>
  );
}
