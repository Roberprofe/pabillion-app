import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Falta DATABASE_URL en .env");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const centro = await prisma.centro.upsert({
    where: { nombre: "Centro Lúa (ejemplo)" },
    update: {},
    create: { nombre: "Centro Lúa (ejemplo)" },
  });

  for (const nombre of ["Pista 1", "Sala 2"]) {
    await prisma.espacio.upsert({
      where: { centroId_nombre: { centroId: centro.id, nombre } },
      update: {},
      create: { centroId: centro.id, nombre },
    });
  }
  console.log("Datos ficticios preparados: un centro y dos espacios.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
