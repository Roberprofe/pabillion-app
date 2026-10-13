"use client";

import { Button } from "@/components/ui/button";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto max-w-5xl space-y-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">No se han podido cargar los centros</h1>
      <p role="alert" className="max-w-2xl text-muted-foreground">
        No es una lista vacía: la lectura ha fallado. Comprueba PostgreSQL con <code>pnpm run db:up</code> y{" "}
        <code>pnpm run db:check</code>. Si sigue fallando, revisa la terminal del servidor.
      </p>
      <Button type="button" onClick={() => retry()}>Volver a intentar</Button>
    </main>
  );
}
