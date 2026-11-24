import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { crearCentro } from "../actions";

export default function FormularioCreacion() {
  return (
    <form action={crearCentro} className="space-y-6">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="nombre">Nombre del centro</Label>
        <Input
          type="text"
          name="nombre"
          id="nombre"
          min={1}
          max={80}
          required
        />
      </div>
      <Button variant="outline">Crear centro</Button>
    </form>
  );
}
