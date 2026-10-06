import "dotenv/config";
import assert from "node:assert/strict";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Falta DATABASE_URL en .env");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 }),
});

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  const centros = await prisma.centro.findMany({
    select: { nombre: true, _count: { select: { espacios: true } } },
  });
  console.log("Conexión PostgreSQL y consulta Prisma correctas.");
  console.table(centros.map((centro) => ({
    centro: centro.nombre,
    espacios: centro._count.espacios,
  })));

  // En CI se verifica el seed; la comprobación normal permite una base vacía.
  if (process.argv.includes("--seeded")) {
    const ejemplo = await prisma.centro.findUnique({
      where: { nombre: "Centro Lúa (ejemplo)" },
      select: { espacios: { select: { nombre: true } } },
    });
    assert.ok(ejemplo, "Falta el centro del seed");
    assert.deepEqual(
      ejemplo.espacios.map((espacio) => espacio.nombre).sort(),
      ["Pista 1", "Sala 2"],
      "El seed debe dejar exactamente los dos espacios de ejemplo",
    );
    console.log("Datos de ejemplo comprobados: un centro y dos espacios, sin duplicados.");
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
