import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioActividad } from "./formulario";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Solo se muestran mensajes fijos para códigos conocidos.
const errores: Record<string, string> = {
  datos:
    "Revisa los datos: el nombre es obligatorio (máximo 80 caracteres) y la descripción admite hasta 500.",
  guardado:
    "No se pudo guardar la actividad. Inténtalo de nuevo en unos instantes.",
};

export default async function NuevaActividadPage({ searchParams }: Props) {
  const parametros = await searchParams;
  const codigo = parametros.error;
  const mensaje =
    typeof codigo === "string" && Object.hasOwn(errores, codigo)
      ? errores[codigo]
      : null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Nueva actividad</h1>
      {mensaje && (
        <Alert variant="destructive">
          <AlertDescription>{mensaje}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Datos de la actividad</CardTitle>
          <CardDescription>
            Se creará activa y sin sesiones. Los nombres pueden repetirse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioActividad />
        </CardContent>
      </Card>
    </main>
  );
}