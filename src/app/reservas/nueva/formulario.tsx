
"use client";

import { useState } from "react";
import { registrarSolicitud } from "../actions";

type Usuario = {
  id: string;
  nombre: string;
};

type Espacio = {
  id: string;
  nombre: string;
  centro: {
    nombre: string;
  };
};

type Props = {
  usuarios: Usuario[];
  espacios: Espacio[];
};

export default function FormularioSolicitud({
  usuarios,
  espacios,
}: Props) {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  const opcionesCompletas =
    usuarios.length > 0 && espacios.length > 0;

  function convertirFechaISO(fechaLocal: string) {
    if (!fechaLocal) {
      return "";
    }

    // datetime-local se interpreta en la zona horaria
    // local del dispositivo.
    return new Date(fechaLocal).toISOString();
  }

  return (
    <form
      action={registrarSolicitud}
      className="space-y-6 rounded-xl border p-6"
    >
      {/* Solicitante */}
      <div>
        <label
          htmlFor="solicitanteId"
          className="mb-2 block font-medium"
        >
          Solicitante
        </label>

        <select
          id="solicitanteId"
          name="solicitanteId"
          required
          defaultValue=""
          disabled={usuarios.length === 0}
          className="w-full rounded-lg border p-3"
        >
          <option value="" disabled>
            Selecciona un usuario
          </option>

          {usuarios.map((usuario) => (
            <option
              key={usuario.id}
              value={usuario.id}
            >
              {usuario.nombre} · {usuario.id.slice(-6)}
            </option>
          ))}
        </select>

        {usuarios.length === 0 && (
          <p className="mt-2 text-sm text-amber-700">
            No hay usuarios activos disponibles.
          </p>
        )}
      </div>

      {/* Espacio */}
      <div>
        <label
          htmlFor="espacioId"
          className="mb-2 block font-medium"
        >
          Espacio
        </label>

        <select
          id="espacioId"
          name="espacioId"
          required
          defaultValue=""
          disabled={espacios.length === 0}
          className="w-full rounded-lg border p-3"
        >
          <option value="" disabled>
            Selecciona un espacio
          </option>

          {espacios.map((espacio) => (
            <option
              key={espacio.id}
              value={espacio.id}
            >
              {espacio.centro.nombre} — {espacio.nombre}
            </option>
          ))}
        </select>

        {espacios.length === 0 && (
          <p className="mt-2 text-sm text-amber-700">
            No hay espacios activos disponibles.
          </p>
        )}
      </div>

      {/* Inicio */}
      <div>
        <label
          htmlFor="inicioLocal"
          className="mb-2 block font-medium"
        >
          Fecha y hora de inicio
        </label>

        <input
          id="inicioLocal"
          type="datetime-local"
          required
          value={inicio}
          onChange={(event) => setInicio(event.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="hidden"
          name="inicio"
          value={convertirFechaISO(inicio)}
        />
      </div>

      {/* Fin */}
      <div>
        <label
          htmlFor="finLocal"
          className="mb-2 block font-medium"
        >
          Fecha y hora de fin
        </label>

        <input
          id="finLocal"
          type="datetime-local"
          required
          value={fin}
          onChange={(event) => setFin(event.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="hidden"
          name="fin"
          value={convertirFechaISO(fin)}
        />
      </div>

      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        Las fechas se introducirán según la zona horaria
        de tu dispositivo y se enviarán al servidor como
        instantes ISO.
      </p>

      <p className="text-sm text-gray-500">
        Zona horaria del dispositivo:{" "}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </p>

      {/* Botones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!opcionesCompletas || !inicio || !fin}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Registrar solicitud
        </button>

        <a
          href="/reservas"
          className="rounded-lg border px-5 py-3 text-center hover:bg-gray-50"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
