import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Gestión deportiva · Afondamento", template: "%s · Gestión deportiva" },
  description: "Base común del proyecto de gestión de instalaciones deportivas de Afondamento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <TooltipProvider>
          <header className="border-b">
            <nav aria-label="Navegación principal" className="mx-auto flex max-w-5xl flex-wrap items-center gap-5 px-6 py-4 text-sm">
              <Link href="/" className="mr-auto font-semibold">Gestión deportiva</Link>
              <Link href="/centros" className="hover:underline">Centros</Link>
              <Link href="/reservas" className="hover:underline">Reservas</Link>
              <Link href="/actividades" className="hover:underline">Actividades</Link>
              <Link href="/ejemplo-fetching" prefetch={false} className="hover:underline">Ejemplo de datos</Link>
            </nav>
          </header>
          {children}
          <Toaster theme="light" />
        </TooltipProvider>
      </body>
    </html>
  );
}
