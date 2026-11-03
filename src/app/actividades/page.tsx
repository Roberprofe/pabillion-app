
import { getPrisma } from "@/lib/prisma";

export default async function ActividadesPage() {
  const prisma = getPrisma();

  const centros = await prisma.centro.findMany({
    orderBy: {
      nombre: "asc",
    },
    include: {
      espacios: {
        where: {
          activo: true,
        },
        orderBy: {
          nombre: "asc",
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Actividades y sesiones
        </h1>

        <p className="text-gray-600">
          Consulta los centros y sus espacios activos para
          planificar futuras actividades.
        </p>

        <p className="text-sm text-gray-500">
          Esta lista es orientativa: no confirma la disponibilidad
          de los espacios ni la existencia de actividades o sesiones.
        </p>
      </header>

      {centros.length === 0 ? (
        <p>
          No hay centros registrados.
        </p>
      ) : (
        <section className="space-y-4">
          {centros.map((centro) => (
            <article
              key={centro.id}
              className="rounded-lg border p-4"
            >
              <h2 className="text-xl font-semibold">
                {centro.nombre}
              </h2>

              {centro.espacios.length === 0 ? (
                <p className="mt-2 text-gray-600">
                  Este centro no tiene espacios activos.
                </p>
              ) : (
                <ul className="mt-3 list-disc space-y-1 pl-6">
                  {centro.espacios.map((espacio) => (
                    <li key={espacio.id}>
                      {espacio.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
