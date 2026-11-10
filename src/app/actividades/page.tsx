import { obtenerActividadesConSesiones } from "@/lib/data/actividades";
import type { SituacionActividad } from "@/lib/data/actividades";
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

const formatFechaHora = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

function mostrarFechaHora(fecha: Date) {
  return formatFechaHora.format(fecha);
}

type SearchParams = {
  situacion?: string | string[];
};

function validarSituacion(params: SearchParams): {
  situacion: SituacionActividad;
  invalida: boolean;
} {
  const valor = params.situacion;

  // Repeated query parameters are invalid, even if their values match.
  if (Array.isArray(valor)) {
    return { situacion: "TODAS", invalida: true };
  }

  // Missing or empty parameter means all activities.
  if (valor === undefined || valor === "") {
    return { situacion: "TODAS", invalida: false };
  }

  if (valor === "TODAS" || valor === "ACTIVAS" || valor === "INACTIVAS") {
    return { situacion: valor, invalida: false };
  }

  return { situacion: "TODAS", invalida: true };
}

const filtros: { valor: SituacionActividad; etiqueta: string }[] = [
  { valor: "TODAS", etiqueta: "Todas" },
  { valor: "ACTIVAS", etiqueta: "Activas" },
  { valor: "INACTIVAS", etiqueta: "Inactivas" },
];

export default async function ActividadesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { situacion, invalida } = validarSituacion(params);

  const [actividades, centros] = await Promise.all([
    invalida ? Promise.resolve([]) : obtenerActividadesConSesiones(situacion),
    obtenerCentrosConEspacios(),
  ]);

  const etiquetaSeleccionada =
    filtros.find((filtro) => filtro.valor === situacion)?.etiqueta ?? "Todas";

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

        <div className="space-y-3">
          <p className="text-sm font-medium">Filtrar por situación:</p>

          <nav
            aria-label="Filtrar actividades"
            className="flex flex-wrap gap-2"
          >
            {filtros.map((filtro) => {
              const href =
                filtro.valor === "TODAS"
                  ? "/actividades"
                  : `/actividades?situacion=${filtro.valor}`;

              const seleccionado = !invalida && situacion === filtro.valor;

              return (
                <a
                  key={filtro.valor}
                  href={href}
                  aria-current={seleccionado ? "page" : undefined}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    seleccionado
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {filtro.etiqueta}
                </a>
              );
            })}
          </nav>
        </div>

        {invalida ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Filtro no válido</EmptyTitle>
              <EmptyDescription>
                El parámetro de situación no es válido o aparece más de una vez.
                Selecciona uno de los filtros disponibles.
              </EmptyDescription>
            </EmptyHeader>
            <a
              href="/actividades"
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Mostrar todas las actividades
            </a>
          </Empty>
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Filtro seleccionado: <strong>{etiquetaSeleccionada}</strong>.{" "}
              Resultados: <strong>{actividades.length}</strong>.
            </p>

            {actividades.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyTitle>
                    {situacion === "TODAS"
                      ? "No hay actividades registradas"
                      : "No hay actividades para este filtro"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {situacion === "TODAS"
                      ? "Cuando se registren actividades, aparecerán en esta sección."
                      : "No se han encontrado actividades que coincidan con la situación seleccionada."}
                  </EmptyDescription>
                </EmptyHeader>
                {situacion !== "TODAS" && (
                  <a
                    href="/actividades"
                    className="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    Quitar filtro y mostrar todas
                  </a>
                )}
              </Empty>
            ) : (
              <div className="grid gap-4">
                {actividades.map((actividad) => (
                  <Card key={actividad.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {actividad.nombre}
                      </CardTitle>

                      {actividad.descripcion && (
                        <CardDescription>
                          {actividad.descripcion}
                        </CardDescription>
                      )}

                      <CardAction>
                        <Badge
                          variant={actividad.activo ? "default" : "secondary"}
                        >
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
          </>
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
