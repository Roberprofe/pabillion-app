import { obtenerActividadesConSesiones } from "@/lib/data/actividades";
import { obtenerCentrosConEspacios } from "@/lib/data/centros";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

// Configure date and time formatting using Spanish conventions
// and the Madrid time zone, regardless of the server's time zone.
const formatFechaHora = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

// Convert a JavaScript Date object into a readable date and time string.

function mostrarFechaHora(fecha: Date) {
  return formatFechaHora.format(fecha);
}

// Fetch activities and centres at the same time instead of waiting
// for one database query to finish before starting the other.
export default async function ActividadesPage() {
  const [actividades, centros] = await Promise.all([
    obtenerActividadesConSesiones(),
    obtenerCentrosConEspacios(),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Actividades y sesiones</h1>

        <p className="text-muted-foreground">
          Consulta las actividades registradas y las sesiones organizadas para
          cada una.
        </p>

        <p className="text-sm text-muted-foreground">
          Las sesiones canceladas se muestran para conservar su información
          histórica. No representan ocupación confirmada.
        </p>
      </header>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Actividades</h2>
          <p className="text-sm text-muted-foreground">
            Actividades ordenadas alfabéticamente y sus sesiones por fecha de
            inicio.
          </p>
        </div>

        {actividades.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No hay actividades registradas</EmptyTitle>
              <EmptyDescription>
                Cuando se registren actividades, aparecerán en esta sección.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4">
            {actividades.map((actividad) => (
              <Card key={actividad.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{actividad.nombre}</CardTitle>

                  {actividad.descripcion && (
                    <CardDescription>{actividad.descripcion}</CardDescription>
                  )}

                  <CardAction>
                    <Badge variant={actividad.activo ? "default" : "secondary"}>
                      {actividad.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </CardAction>
                </CardHeader>

                <CardContent>
                  {actividad.sesiones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Esta actividad todavía no tiene sesiones.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">
                        Sesiones ({actividad.sesiones.length})
                      </h3>

                      <div className="space-y-3">
                        {actividad.sesiones.map((sesion) => (
                          <div
                            key={sesion.id}
                            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium">
                                  {sesion.espacio.nombre}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {sesion.espacio.centro.nombre}
                                </p>
                              </div>

                              <div className="grid gap-1 text-sm sm:grid-cols-2 sm:gap-4">
                                <p>
                                  <span className="text-muted-foreground">
                                    Inicio:{" "}
                                  </span>
                                  {mostrarFechaHora(sesion.inicio)}
                                </p>

                                <p>
                                  <span className="text-muted-foreground">
                                    Fin:{" "}
                                  </span>
                                  {mostrarFechaHora(sesion.fin)}
                                </p>
                              </div>
                            </div>

                            <Badge
                              variant={
                                sesion.estado === "CANCELADA"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {sesion.estado === "CANCELADA"
                                ? "Cancelada"
                                : "Programada"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Centros y espacios</h2>
          <p className="text-sm text-muted-foreground">
            Espacios activos disponibles como referencia para la planificación.
          </p>
        </div>

        {centros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay centros registrados.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {centros.map((centro) => {
              // Only display active spaces in the planning section.
              // Inactive spaces are excluded from this list.
              const espaciosActivos = centro.espacios.filter(
                (espacio) => espacio.activo,
              );

              return (
                <Card key={centro.id}>
                  <CardHeader>
                    <CardTitle>{centro.nombre}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    {espaciosActivos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Este centro no tiene espacios activos.
                      </p>
                    ) : (
                      <ul className="list-disc space-y-1 pl-5 text-sm">
                        {espaciosActivos.map((espacio) => (
                          <li key={espacio.id}>{espacio.nombre}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
