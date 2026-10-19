import type { Metadata } from "next";
import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerCentrosConEspacios } from "@/lib/data/centros";

export const metadata: Metadata = {
  title: "Centros y Espacios",
  description: "Búsqueda de centros y espacios disponibles.",
};

export default async function CentrosPage() {
  await connection(); 
  const centros = await obtenerCentrosConEspacios();

  
  
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Centros y Espacios</h1>
        <p className="text-muted-foregound">Este es el registro de los centros que trabajan con nosotros.</p>
      </header>

      {centros.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Actualmente no hay centros</h2>
            </CardTitle>
            <CardDescription> 
              {/* Se ha consultado la base, pero no hay datos  */}
              En estos momentos no tenemos centros registrados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section aria-label="Centros registrados" className="grid gap-6 md:grid-cols-2">
          {centros.map((centro) => (
            <Card key={centro.id}>
              <CardHeader>
                <CardTitle>
                  <h2>{centro.nombre}</h2>
                </CardTitle>
                <CardDescription>
                  {centro.espacios.length} {centro.espacios.length === 1 ? "Espacio" : "Espacios"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {centro.espacios.length === 0 ? (
                  <p className="text-sm text-muted-foregorund">Sin espacios</p>
                ) : (
                  <ul className="divide-y">
                    {centro.espacios.map((espacio) => (
                      <li key={espacio.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="min-w-0 break-words">{espacio.nombre}</span>
                        <Badge variant="outline" className={espacio.activo ? "text-lime-600 border-lime-600" : "text-rose-600 border-rose-600"}>
                          {espacio.activo ? "activo" : "inactivo" }
                        </Badge>
                      </li>))}
                  </ul>
                )} 
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
  //<ModulePlaceholder team="A" title="Centros y espacios" description="Aquí se desarrollará la configuración de centros, espacios, horarios y cierres." />;
}
