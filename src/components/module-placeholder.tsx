import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePlaceholderProps = { team: "A" | "B" | "C"; title: string; description: string };

export function ModulePlaceholder({ team, title, description }: ModulePlaceholderProps) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Badge variant="secondary">Equipo {team} · Por desarrollar</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      <Card className="mt-8 max-w-2xl">
        <CardHeader><CardTitle>Punto de partida</CardTitle></CardHeader>
        <CardContent>Esta página está preparada para la primera issue de implementación que asigne el profesor. Todavía no consulta ni modifica datos.</CardContent>
      </Card>
    </main>
  );
}
