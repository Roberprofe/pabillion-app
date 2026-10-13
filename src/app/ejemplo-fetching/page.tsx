import type { Metadata } from "next";
import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerCentrosConEspacios } from "@/lib/data/centros";

export const metadata: Metadata = {
  title: "Ejemplo de lectura de datos",
  description: "Lectura en servidor de centros y espacios con Prisma y PostgreSQL.",
};

export default async function EjemploFetchingPage() {
  // Consultamos durante la petición, no al prerenderizar la aplicación en build.
  await connection();
  const centros = await obtenerCentrosConEspacios();

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header className="max-w-2xl space-y-3">
        <Badge variant="secondary">Ejemplo · Lectura en servidor</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Centros y espacios desde PostgreSQL</h1>
        <p className="text-muted-foreground">
          Estos registros proceden de tu base local. Cambia un nombre en Prisma Studio,
          guarda y recarga esta página para comprobarlo.
        </p>
      </header>

      {centros.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle><h2>No hay centros registrados</h2></CardTitle>
            <CardDescription>La consulta ha funcionado, pero no ha encontrado centros.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Para cargar datos ficticios en tu base local, ejecuta <code>pnpm run db:seed</code> y recarga.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section aria-label="Centros registrados" className="grid gap-6 md:grid-cols-2">
          {centros.map((centro) => (
            <Card key={centro.id}>
              <CardHeader>
                <CardTitle><h2>{centro.nombre}</h2></CardTitle>
                <CardDescription>
                  {centro.espacios.length} {centro.espacios.length === 1 ? "espacio" : "espacios"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {centro.espacios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Este centro todavía no tiene espacios.</p>
                ) : (
                  <ul className="divide-y">
                    {centro.espacios.map((espacio) => (
                      <li key={espacio.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="min-w-0 break-words">{espacio.nombre}</span>
                        <Badge variant={espacio.activo ? "secondary" : "outline"}>
                          {espacio.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Activo no significa disponible. Este ejemplo no comprueba horarios, cierres, reservas ni sesiones.
      </p>
    </main>
  );
}
