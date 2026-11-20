import FormularioCreacion from "@/app/centros/nuevo/formulario";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errores: Record<string, string> = {
  datos: "El centro ha de contener entre 0 y 80 caracteres",
  duplicado: "Un centro con ese nombre ya existe.",
  guardado:
    "No se pudo crear el centro. Comprueba la conexión e inténtalo de nuevo.",
};

export default async function NuevoCentroPage({ searchParams }: Props) {
  const parametros = await searchParams;
  const codigo = parametros.error;
  const mensaje =
    typeof codigo === "string" && Object.hasOwn(errores, codigo)
      ? errores[codigo]
      : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Crea un nuevo centro
          </CardTitle>
          <CardDescription>
            Añade un centro al registro de la aplicación.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {mensaje !== null ? (
            <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
              {mensaje}
            </p>
          ) : null}
          <FormularioCreacion />
        </CardContent>
      </Card>
    </main>
  );
}
