import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modules = [
  { team: "A", title: "Centros y espacios", href: "/centros", description: "Los lugares, horarios y cierres que necesitan reservas y actividades." },
  { team: "B", title: "Solicitudes y reservas", href: "/reservas", description: "El recorrido desde una petición hasta su aprobación o cancelación." },
  { team: "C", title: "Actividades y sesiones", href: "/actividades", description: "Las actividades organizadas y cada fecha en la que ocupan un espacio." },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-10 max-w-2xl space-y-4">
        <Badge variant="secondary">Afondamento · Repositorio común</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">Gestión deportiva</h1>
        <p className="text-lg text-muted-foreground">
          Una aplicación para gestionar centros, espacios y sus usos. Esta es la base de trabajo de los tres equipos; el nombre del producto sigue pendiente.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.team}>
            <CardHeader>
              <CardDescription>Equipo {module.team}</CardDescription>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">{module.description}</p>
              <Link href={module.href} className={buttonVariants({ variant: "outline" })}>Abrir módulo</Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">Los módulos son puntos de partida. Las tareas y sus criterios se asignan en GitHub Projects.</p>
    </main>
  );
}
