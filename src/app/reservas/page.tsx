import { connection } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { obtenerReservas } from "@/lib/data/reservas";

// Formateamos las fechas para que se vean como en la captura (d/m/yy, H:mm)
function formatearFecha(fecha: Date | string | null) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-ES", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReservasPage() {
  await connection();


  const prisma = getPrisma();


  let espacios;
  let centrosActivos;
  let reservas;


  try {
    // Obtener los espacios activos con su centro.
    espacios = await prisma.espacio.findMany({
      where: {
        activo: true,
      },
      include: {
        centro: true,
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


    // Obtener los centros que tienen al menos un espacio activo.
    centrosActivos = await prisma.centro.findMany({
      where: {
        espacios: {
          some: {
            activo: true,
          },
        },
      },
      orderBy: {
        nombre: "asc",
      },
    });
    reservas = await obtenerReservas();
  } catch (error) {
    console.error("Error al cargar los espacios o reservas:", error);


    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-3xl font-bold">
          Solicitudes y reservas
        </h1>


        <p className="mt-4 rounded-lg border border-red-300 p-4">
          No se han podido cargar los espacios y centros. Comprueba la
          conexión con la base de datos.
        </p>
      </main>
    );
  }


  // Agrupar los espacios activos por centro.
  const centros = new Map<
    string,
    {
      id: string;
      nombre: string;
      espacios: typeof espacios;
    }
  >();


  for (const espacio of espacios) {
    const idCentro = espacio.centro.id;


    if (!centros.has(idCentro)) {
      centros.set(idCentro, {
        id: idCentro,
        nombre: espacio.centro.nombre,
        espacios: [],
      });
    }


    centros.get(idCentro)!.espacios.push(espacio);
  }


  const listaCentros = Array.from(centros.values());


  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-600">
          GESTIÓN DE ESPACIOS
        </p>


        <h1 className="text-3xl font-bold tracking-tight">
          Solicitudes y reservas
        </h1>


        <p className="mt-3 text-gray-600">
          Consulta los centros registrados y sus espacios activos.
        </p>
      </header>


      {/* Lista independiente de centros activos */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">
          Lista de centros activos
        </h2>


        {centrosActivos.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="font-semibold">
              No hay centros activos
            </p>


            <p className="mt-2 text-sm text-gray-600">
              No hay centros con espacios activos registrados.
            </p>
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {centrosActivos.map((centro) => (
              <li
                key={centro.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <span className="font-medium">
                  {centro.nombre}
                </span>


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
        <p className="text-sm text-gray-500">
          Centros con espacios activos
        </p>


        <p className="mt-1 text-3xl font-bold">
          {centrosActivos.length}
        </p>


        <p className="mt-4 text-sm text-gray-500">
          Total de espacios activos
        </p>


        <p className="mt-1 text-2xl font-bold">
          {espacios.length}
        </p>
      </section>


      {/* Aviso sobre la disponibilidad */}
      <aside className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Importante:</strong> que un espacio esté activo no significa
        que esté libre para una fecha u horario concreto. Esta página todavía
        no comprueba la disponibilidad.
      </aside>


      {/* Listado de centros con sus espacios */}
      {listaCentros.length === 0 ? (
        <section className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">
            No hay centros con espacios activos
          </h2>


          <p className="mt-2 text-gray-600">
            Cuando se registren espacios activos, aparecerán aquí.
          </p>
        </section>
      ) : (
        <section>
          <h2 className="mb-4 text-xl font-bold">
            Centros y sus espacios
          </h2>


          <div className="space-y-6">
            {listaCentros.map((centro) => (
              <article
                key={centro.id}
                className="overflow-hidden rounded-xl border"
              >
                <div className="border-b bg-gray-50 px-5 py-4">
                  <h3 className="text-lg font-semibold">
                    {centro.nombre}
                  </h3>


                  <p className="mt-1 text-sm text-gray-600">
                    {centro.espacios.length}{" "}
                    {centro.espacios.length === 1
                      ? "espacio activo"
                      : "espacios activos"}
                  </p>
                </div>


                <div className="divide-y">
                  {centro.espacios.map((espacio) => (
                    <div
                      key={espacio.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h4 className="font-semibold">
                          {espacio.nombre}
                        </h4>


                        <p className="mt-1 text-sm text-gray-600">
                          Centro: {centro.nombre}
                        </p>
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


      {/* Añadimos la tabla de reservas al final de la página */}
      <section className="mt-12 mb-12">
        <h2 className="mb-6 text-xl font-bold">Reservas</h2>
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Solicitante
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Espacio
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Centro
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Inicio
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Fin
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Estado
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">
                  Resolución
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(reservas ?? []).map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {reserva.solicitante?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3">{reserva.espacio?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">
                    {reserva.espacio?.centro?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3">{formatearFecha(reserva.inicio)}</td>
                  <td className="px-4 py-3">{formatearFecha(reserva.fin)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        String(reserva.estado) === "PENDIENTE"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : String(reserva.estado) === "CONFIRMADA"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : String(reserva.estado) === "CANCELADA"
                          ? "bg-gray-100 text-gray-600 border-gray-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {reserva.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {String(reserva.estado) === "PENDIENTE" ? (
                      <p className="text-gray-600">
                        Pendiente de resolución
                      </p>
                    ) : (
                      <>
                        <p className="text-gray-800 font-medium">
                          {reserva.resueltaPor?.nombre ?? "Resuelto"} -{" "}
                          {formatearFecha(reserva.resueltaEn)}
                        </p>
                        {reserva.motivoResolucion ? (
                          <p className="mt-1 text-sm text-gray-500">
                            Motivo: {reserva.motivoResolucion}
                          </p>
                        ) : null}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>


      <p className="mt-6 text-sm text-gray-500">
        Esta página es una consulta informativa. Todavía no permite crear,
        aprobar, rechazar ni cancelar reservas.
      </p>
    </main>
  );
}