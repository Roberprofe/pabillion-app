import Link from "next/link";
import { connection } from "next/server";

import { EstadoReserva } from "@/generated/prisma/client";
import { obtenerReservas, type ReservaListada } from "@/lib/data/reservas";
import { getPrisma } from "@/lib/prisma";

// Fechas siempre en hora de Madrid, sin depender de la zona del servidor.
const formatoFecha = new Intl.DateTimeFormat("es-ES", {
  timeZone: "Europe/Madrid",
  day: "numeric",
  month: "numeric",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatearFecha(fecha: Date | null) {
  return fecha ? formatoFecha.format(fecha) : "—";
}

const ESTADOS_VISIBLES: Record<EstadoReserva, { texto: string; clases: string }> = {
  PENDIENTE: { texto: "Pendiente", clases: "border-amber-200 bg-amber-100 text-amber-800" },
  CONFIRMADA: { texto: "Confirmada", clases: "border-green-200 bg-green-100 text-green-800" },
  RECHAZADA: { texto: "Rechazada", clases: "border-red-200 bg-red-100 text-red-800" },
  CANCELADA: { texto: "Cancelada", clases: "border-gray-200 bg-gray-100 text-gray-600" },
};

type ReservasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Resultado de validar ?estado=. Se distinguen tres casos: sin filtro,
// estado admitido y valor no admitido (inventado o repetido).
type Filtro =
  | { tipo: "todos" }
  | { tipo: "estado"; estado: EstadoReserva }
  | { tipo: "invalido" };

function validarFiltro(entrada: string | string[] | undefined): Filtro {
  // Un parámetro repetido llega como array: no se acepta solo el primero.
  if (Array.isArray(entrada)) return { tipo: "invalido" };
  if (entrada === undefined || entrada === "" || entrada === "TODOS") return { tipo: "todos" };

  // Se comprueba que el texto pertenece al enum de Prisma, sin cast.
  const estado = Object.values(EstadoReserva).find((valor) => valor === entrada);
  return estado === undefined ? { tipo: "invalido" } : { tipo: "estado", estado };
}

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  await connection();

  const parametros = await searchParams;
  const filtro = validarFiltro(parametros.estado);
  const valorSelect = filtro.tipo === "estado" ? filtro.estado : "TODOS";

  const prisma = getPrisma();

  let espacios;
  let centrosActivos;
  // Con un filtro no válido no se consulta ninguna reserva.
  let reservas: ReservaListada[] = [];

  try {
    // Sección auxiliar de B-03: no depende del filtro de reservas.
    espacios = await prisma.espacio.findMany({
      where: { activo: true },
      include: { centro: true },
      orderBy: [{ centro: { nombre: "asc" } }, { nombre: "asc" }],
    });

    centrosActivos = await prisma.centro.findMany({
      where: { espacios: { some: { activo: true } } },
      orderBy: { nombre: "asc" },
    });

    if (filtro.tipo !== "invalido") {
      reservas = await obtenerReservas(filtro.tipo === "estado" ? filtro.estado : undefined);
    }
  } catch (error) {
    console.error("Error al cargar los espacios o reservas:", error);

    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-3xl font-bold">Solicitudes y reservas</h1>

        <p role="alert" className="mt-4 rounded-lg border border-red-300 p-4">
          No se han podido cargar los datos. Comprueba la conexión con la base de datos.
        </p>
      </main>
    );
  }

  // Confirmación de una solicitud recién creada: solo se muestra si esa
  // solicitud existe y aparece entre las pendientes consultadas.
  const idCreada = typeof parametros.creada === "string" ? parametros.creada : undefined;
  const solicitudCreada =
    idCreada !== undefined &&
    reservas.some((reserva) => reserva.id === idCreada && reserva.estado === EstadoReserva.PENDIENTE);

  // Agrupar los espacios activos por centro.
  const centros = new Map<string, { id: string; nombre: string; espacios: typeof espacios }>();

  for (const espacio of espacios) {
    const idCentro = espacio.centro.id;

    if (!centros.has(idCentro)) {
      centros.set(idCentro, { id: idCentro, nombre: espacio.centro.nombre, espacios: [] });
    }

    centros.get(idCentro)!.espacios.push(espacio);
  }

  const listaCentros = Array.from(centros.values());

  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-600">GESTIÓN DE ESPACIOS</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes y reservas</h1>

          <Link
            href="/reservas/nueva"
            className="inline-flex w-fit items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Nueva solicitud
          </Link>
        </div>

        <p className="mt-3 text-gray-600">
          Consulta los centros registrados, sus espacios activos y las reservas.
        </p>
      </header>

      {solicitudCreada && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800"
        >
          Solicitud registrada, pendiente de revisión. Aparece resaltada en el listado de
          pendientes.{" "}
          <Link href="/reservas" className="font-medium underline">
            Volver al listado completo
          </Link>
        </div>
      )}

      {/* Lista de centros activos */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Lista de centros activos</h2>

        {centrosActivos.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="font-semibold">No hay centros activos</p>

            <p className="mt-2 text-sm text-gray-600">
              No hay centros con espacios activos registrados.
            </p>
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {centrosActivos.map((centro) => (
              <li key={centro.id} className="flex items-center justify-between gap-4 p-4">
                <span className="font-medium">{centro.nombre}</span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Activo
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Estadísticas */}
      <section className="mb-6 rounded-xl border p-5">
        <p className="text-sm text-gray-500">Centros con espacios activos</p>

        <p className="mt-1 text-3xl font-bold">{centrosActivos.length}</p>

        <p className="mt-4 text-sm text-gray-500">Total de espacios activos</p>

        <p className="mt-1 text-2xl font-bold">{espacios.length}</p>
      </section>

      {/* Aviso sobre la disponibilidad */}
      <aside className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Importante:</strong> que un espacio esté activo no significa que esté libre para
        una fecha u horario concreto. Esta página todavía no comprueba la disponibilidad.
      </aside>

      {/* Listado de centros y espacios */}
      {listaCentros.length === 0 ? (
        <section className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">No hay centros con espacios activos</h2>

          <p className="mt-2 text-gray-600">Cuando se registren espacios activos, aparecerán aquí.</p>
        </section>
      ) : (
        <section>
          <h2 className="mb-4 text-xl font-bold">Centros y sus espacios</h2>

          <div className="space-y-6">
            {listaCentros.map((centro) => (
              <article key={centro.id} className="overflow-hidden rounded-xl border">
                <div className="border-b bg-gray-50 px-5 py-4">
                  <h3 className="text-lg font-semibold">{centro.nombre}</h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {centro.espacios.length}{" "}
                    {centro.espacios.length === 1 ? "espacio activo" : "espacios activos"}
                  </p>
                </div>

                <div className="divide-y">
                  {centro.espacios.map((espacio) => (
                    <div
                      key={espacio.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h4 className="font-semibold">{espacio.nombre}</h4>

                        <p className="mt-1 text-sm text-gray-600">Centro: {centro.nombre}</p>
                      </div>

                      <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        Activo
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Reservas y filtro por estado */}
      <section className="mt-12 mb-12">
        <h2 className="mb-4 text-xl font-bold">Reservas</h2>

        {/* Formulario GET: consulta, no modifica nada */}
        <form
          action="/reservas"
          method="get"
          className="mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="estado" className="mb-2 block text-sm font-medium text-gray-700">
              Filtrar por estado
            </label>

            <select
              id="estado"
              name="estado"
              defaultValue={valorSelect}
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Filtrar
          </button>

          <a
            href="/reservas"
            className="rounded-lg border px-5 py-2.5 text-center font-medium hover:bg-gray-50"
          >
            Quitar filtro
          </a>
        </form>

        {filtro.tipo === "invalido" ? (
          // Filtro no admitido: aviso, sin consultar ni listar reservas.
          <div
            role="alert"
            className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          >
            El filtro no es válido. Elige un único estado de la lista (Todos, Pendiente,
            Confirmada, Rechazada o Cancelada).{" "}
            <a href="/reservas" className="font-medium underline">
              Quitar filtro
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl border p-4">
              <p className="text-sm text-gray-600">
                Filtro seleccionado:{" "}
                <strong>
                  {filtro.tipo === "estado" ? ESTADOS_VISIBLES[filtro.estado].texto : "Todos los estados"}
                </strong>
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Total de resultados: <strong>{reservas.length}</strong>
              </p>
            </div>

            {reservas.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                {filtro.tipo === "estado" ? (
                  <>
                    <h3 className="font-semibold">No hay resultados con este filtro</h3>

                    <p className="mt-2 text-sm text-gray-600">
                      No hay reservas en estado {ESTADOS_VISIBLES[filtro.estado].texto.toLowerCase()}.{" "}
                      <a href="/reservas" className="font-medium underline">
                        Quitar filtro
                      </a>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">No hay reservas registradas</h3>

                    <p className="mt-2 text-sm text-gray-600">
                      Cuando se registren solicitudes de reserva, aparecerán aquí.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Solicitante</th>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Espacio</th>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Centro</th>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Inicio</th>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Fin</th>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Estado</th>
                      <th className="border-b px-4 py-3 font-medium text-gray-700">Resolución</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {reservas.map((reserva) => {
                      const estado = ESTADOS_VISIBLES[reserva.estado];
                      const esNueva = solicitudCreada && reserva.id === idCreada;

                      return (
                        <tr
                          key={reserva.id}
                          className={esNueva ? "bg-green-50" : "hover:bg-gray-50"}
                        >
                          <td className="px-4 py-3">{reserva.solicitante.nombre}</td>
                          <td className="px-4 py-3">{reserva.espacio.nombre}</td>
                          <td className="px-4 py-3">{reserva.espacio.centro.nombre}</td>
                          <td className="px-4 py-3">{formatearFecha(reserva.inicio)}</td>
                          <td className="px-4 py-3">{formatearFecha(reserva.fin)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${estado.clases}`}
                            >
                              {estado.texto}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {reserva.resueltaPor && reserva.resueltaEn ? (
                              <>
                                <p className="font-medium text-gray-800">
                                  {reserva.resueltaPor.nombre} · {formatearFecha(reserva.resueltaEn)}
                                </p>

                                {reserva.motivoResolucion ? (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Motivo: {reserva.motivoResolucion}
                                  </p>
                                ) : null}
                              </>
                            ) : reserva.estado === EstadoReserva.PENDIENTE ? (
                              <p className="text-gray-600">Pendiente de resolución</p>
                            ) : (
                              <p className="text-gray-600">Sin datos de resolución</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-sm text-gray-500">
        Pantalla local de prácticas con datos ficticios. Permite consultar reservas y registrar
        solicitudes pendientes, pero no aprueba, rechaza ni cancela, no comprueba disponibilidad
        y no tiene login ni permisos. El filtro no es una autorización ni equivale a «Mis
        reservas».
      </p>
    </main>
  );
}
