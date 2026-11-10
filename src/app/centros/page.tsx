import type { Metadata } from "next";
import { connection } from "next/server";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { obtenerCentrosConEspacios } from "@/lib/data/centros";
import { obtenerEspaciosConHorariosCierres, obtenerEspaciosEnCentro, buscarCentros } from "@/lib/data/espacios";
import { FieldLabel } from "@/components/ui/field"

export const metadata: Metadata = {
  title: "Centros y Espacios",
  description: "Búsqueda de centros y espacios disponibles.",
};

export function toHoursAndMinutes(totalMinutes=0) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CentrosPage({ searchParams }: Props) {
  await connection(); 
  
  //const espacios = await obtenerEspaciosEnCentro();
  const espacios = await obtenerEspaciosConHorariosCierres();

  const entrada = (await searchParams).q;
  if (Array.isArray(entrada) || (typeof entrada === "string" && entrada.length > 80)) {
    return (
      <main>
        <h1>Centros</h1>
        <p role="alert">Usa un único texto de hasta 80 caracteres.</p>
        <a href="/centros">Quitar filtro</a>
      </main>
    );
  }
  const q = (entrada ?? "").trim();
  const centros = await buscarCentros(q);
  
  
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Centros y Espacios
        </h1>
        <p className="text-muted-foregound">
          Este es el registro de los centros que trabajan con nosotros.
        </p>
      </header>
    <form action="/centros" method="get">
      <FieldLabel htmlFor="centro-q">Nombre del centro</FieldLabel>
      <Input className="max-w-sm" placeholder="Introduce el nombre del centro"  id="centro-q" name="q" type="search" maxLength={80} defaultValue={q} />
      <Button className="m-2" variant="outline" type="submit">Buscar</Button>
      <Button variant="outline" className="text-rose-600 hover:text-rose-600 border-rose-600"><a href="/centros">Quitar filtro</a></Button>
    </form>
    <p>{centros.length} centros encontrados</p>

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
        <section aria-label="Centros registrados" className="grid gap-8 md:grid-cols-1">
          {centros.map((centro) => (
            <section key={centro.id}>
              <h2 className="font-bold">{centro.nombre}</h2>
              {centro.espacios.length === 0 ? (
                <h2>Este centro no tiene espacios</h2>
              ) : (
                <section className="grid gap-5 mt-6">
                  {espacios
                    .filter((espacio) => espacio.centro.id === centro.id)
                    .map((espacio) => (
                      <Card key={espacio.id} >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                            <h3 className="min-w-0 break-words">{espacio.nombre}</h3>
                            <Badge variant="outline" className={
                              espacio.activo 
                              ? "text-lime-600 border-lime-600" 
                              : "text-rose-600 border-rose-600"
                              }>
                                {espacio.activo ? "activo" : "inactivo" }
                        </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {espacio.horarios.length === 0 ? (
                            <h3>El espacio no cuenta con horarios</h3>
                          ) : (
                            <ul className="mt-9 divide-y divide-gray-100">
                              {espacio.horarios.map((horario) => (
                                <li key={horario.id} className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-4 py-3 first:pt-0 last:pb-0">
                                  <span className="text-sm font-medium text-gray-800 text-left">{horario.diaSemana}</span>
                                  <span className="text-sm text-gray-600 text-center tabular-nums">{toHoursAndMinutes(horario.inicioMinuto)}</span>
                                  <span className="text-sm text-gray-600 text-center tabular-nums">{toHoursAndMinutes(horario.finMinuto)}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {espacio.cierres.length === 0 ? (
                            <span>El espacio no cuenta con cierres</span>
                          ) : (
                            <ul className="mt-20 divide-y divide-gray-100">
                              {espacio.cierres.map((cierre) => (
                                <li key={cierre.id} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-3 sm:gap-4 py-4 first:pt-0 last:pb-0">
                                  <span className="text-sm font-medium text-gray-800 text-left">{cierre.motivo}</span>
                                  <span className="text-sm text-gray-600 sm:text-center">{cierre.inicio.toDateString()}</span>
                                  <span className="text-sm text-gray-600 sm:text-center">{cierre.fin.toDateString()}</span>
                                  <div className="sm:justify-self-end">
                                    <Badge variant={"outline"} className={
                                      cierre.activo 
                                      ? "text-lime-600 border-lime-600" 
                                      : "text-rose-600 border-rose-600"
                                      }>
                                      {cierre.activo ? "activo" : "anulado"}
                                    </Badge>
                                  </div>
                                </li>
                              ))}
                              
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </section>
              )}
            </section>
          ))}
        </section>
      )}
    </main>
  );
  
}
