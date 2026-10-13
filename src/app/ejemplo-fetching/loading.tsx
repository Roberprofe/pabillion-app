import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10" aria-busy="true">
      <p role="status" className="text-sm text-muted-foreground">Cargando centros y espacios…</p>
      <div aria-hidden="true" className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item}>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
