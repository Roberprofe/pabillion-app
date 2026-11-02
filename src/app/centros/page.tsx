import type { Metadata } from "next";
import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { obtenerCentrosConEspacios } from "@/lib/data/centros";
import { obtenerEspaciosConHorariosCierres, obtenerEspaciosEnCentro } from "@/lib/data/espacios";

export const metadata: Metadata = {
  title: "Centros y Espacios",
  description: "Búsqueda de centros y espacios disponibles.",
};

export function toHoursAndMinutes(totalMinutes=0) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;
}

export default async function CentrosPage() {
  await connection(); 
  const centros = await obtenerCentrosConEspacios();
  //const espacios = await obtenerEspaciosEnCentro();
  const espacios = await obtenerEspaciosConHorariosCierres();
  
  
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
                          <CardTitle>
                            <h3 className="min-w-0 break-words">{espacio.nombre}</h3>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {espacio.horarios.length === 0 ? (
                            <h3>El espacio no cuenta con horarios</h3>
                          ) : (
                            <ul>
                              {espacio.horarios.map((horario) => (
                                <li key={horario.id} className="grid grid-cols-3 text-center gap-4 py-3 first:pt-0 last:pb-0">
                                  <span>{horario.diaSemana}</span>
                                  <span>{toHoursAndMinutes(horario.inicioMinuto)}</span>
                                  <span>{toHoursAndMinutes(horario.finMinuto)}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {espacio.cierres.length === 0 ? (
                            <span>El espacio no cuenta con cierres</span>
                          ) : (
                            <ul className="mt-9">
                              {espacio.cierres.map((cierre) => (
                                <li key={cierre.id} className="grid grid-cols-4 gap-4 text-center py-3 first:pt-0 last:pb-0">
                                  <span>{cierre.motivo}</span>
                                  <span>{cierre.inicio.toDateString()}</span>
                                  <span>{cierre.fin.toDateString()}</span>
                                  <Badge variant={"outline"} className={cierre.activo ? "text-lime-600 border-lime-600" : "text-rose-600 border-rose-600"}>{cierre.activo ? "activo" : "anulado"}</Badge>
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
