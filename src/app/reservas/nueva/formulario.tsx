"use client";

import { useRef, useState, useSyncExternalStore, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { OpcionesSolicitud } from "@/lib/data/reservas";
import { crearSolicitud } from "../actions";

type Props = OpcionesSolicitud;

// Límites del campo datetime-local: años de 4 cifras. Fuera de ahí el
// navegador puede devolver valores que Date no sabe interpretar.
const MINIMO = "2000-01-01T00:00";
const MAXIMO = "2099-12-31T23:59";

// Convierte el valor de datetime-local (hora local del dispositivo) en un
// instante ISO UTC. Devuelve "" si el valor está incompleto o no es válido,
// en lugar de lanzar un error que rompa la página.
function aInstanteISO(fechaLocal: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fechaLocal)) return "";
  const fecha = new Date(fechaLocal);
  return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString();
}

// Zona horaria del dispositivo. En el servidor no se conoce: se devuelve
// null para que el HTML inicial coincida y no haya error de hidratación.
function suscribirse() {
  return () => {};
}
function zonaDelDispositivo() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
function zonaEnServidor() {
  return null;
}

export default function FormularioSolicitud({ usuarios, espacios }: Props) {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [enviando, startTransition] = useTransition();
  // Evita que un doble clic envíe la misma solicitud dos veces antes de que
  // React llegue a desactivar el botón.
  const envioEnCurso = useRef(false);
  const zona = useSyncExternalStore(suscribirse, zonaDelDispositivo, zonaEnServidor);

  const inicioISO = aInstanteISO(inicio);
  const finISO = aInstanteISO(fin);
  const hayOpciones = usuarios.length > 0 && espacios.length > 0;
  const puedeEnviar = hayOpciones && inicioISO !== "" && finISO !== "" && !enviando;

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (envioEnCurso.current || !puedeEnviar) return;
    envioEnCurso.current = true;

    const datos = new FormData(evento.currentTarget);
    startTransition(async () => {
      try {
        // La acción redirige al terminar, con éxito o con error.
        await crearSolicitud(datos);
      } finally {
        envioEnCurso.current = false;
      }
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-6 rounded-xl border p-6">
      <div className="grid gap-2">
        <Label htmlFor="solicitanteId">Solicitante</Label>
        <NativeSelect
          id="solicitanteId"
          name="solicitanteId"
          required
          defaultValue=""
          disabled={usuarios.length === 0}
          className="w-full"
        >
          <NativeSelectOption value="" disabled>
            Selecciona un usuario
          </NativeSelectOption>
          {usuarios.map((usuario) => (
            <NativeSelectOption key={usuario.id} value={usuario.id}>
              {/* El ID visible distingue a personas con el mismo nombre. */}
              {usuario.nombre} (ID: {usuario.id})
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {usuarios.length === 0 && (
          <p className="text-sm text-amber-700">No hay usuarios activos disponibles.</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="espacioId">Espacio</Label>
        <NativeSelect
          id="espacioId"
          name="espacioId"
          required
          defaultValue=""
          disabled={espacios.length === 0}
          className="w-full"
        >
          <NativeSelectOption value="" disabled>
            Selecciona un espacio
          </NativeSelectOption>
          {espacios.map((espacio) => (
            <NativeSelectOption key={espacio.id} value={espacio.id}>
              {espacio.centro.nombre} — {espacio.nombre}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {espacios.length === 0 && (
          <p className="text-sm text-amber-700">No hay espacios activos disponibles.</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="inicioLocal">Fecha y hora de inicio</Label>
        <Input
          id="inicioLocal"
          type="datetime-local"
          required
          min={MINIMO}
          max={MAXIMO}
          value={inicio}
          onChange={(evento) => setInicio(evento.target.value)}
        />
        {inicio !== "" && inicioISO === "" && (
          <p className="text-sm text-red-700">La fecha de inicio no es válida.</p>
        )}
        <input type="hidden" name="inicio" value={inicioISO} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="finLocal">Fecha y hora de fin</Label>
        <Input
          id="finLocal"
          type="datetime-local"
          required
          min={MINIMO}
          max={MAXIMO}
          value={fin}
          onChange={(evento) => setFin(evento.target.value)}
        />
        {fin !== "" && finISO === "" && (
          <p className="text-sm text-red-700">La fecha de fin no es válida.</p>
        )}
        <input type="hidden" name="fin" value={finISO} />
      </div>

      <div className="space-y-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        <p>
          Las horas se introducen en la zona horaria del dispositivo y se envían al servidor como
          instantes UTC. El listado las muestra en hora de Madrid.
        </p>
        <p>
          Zona horaria del dispositivo: <strong>{zona ?? "…"}</strong>
        </p>
        {zona !== null && zona !== "Europe/Madrid" && (
          <p className="font-medium text-amber-800">
            Este dispositivo no está en Europe/Madrid: configúralo en esa zona para que las horas
            introducidas coincidan con las del listado.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={!puedeEnviar}>
          {enviando ? "Registrando…" : "Registrar solicitud"}
        </Button>

        <Button asChild variant="outline" size="lg">
          <a href="/reservas">Cancelar</a>
        </Button>
      </div>
    </form>
  );
}
