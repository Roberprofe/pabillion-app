import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crearActividad } from "../actions";

export function FormularioActividad() {
  return (
    <form action={crearActividad} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          maxLength={80}
          required
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea id="descripcion" name="descripcion" maxLength={500} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Crear actividad</Button>
        <Button asChild variant="outline">
          <Link href="/actividades">Volver al listado</Link>
        </Button>
      </div>
    </form>
  );
}