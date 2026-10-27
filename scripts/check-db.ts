import "dotenv/config";
import assert from "node:assert/strict";
import { PrismaPg } from "@prisma/adapter-pg";
import { EstadoReserva, EstadoSesion, PrismaClient } from "../src/generated/prisma/client";

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
    const totales = {
      usuarios: await prisma.usuario.count(), centros: await prisma.centro.count(),
      espacios: await prisma.espacio.count(), horarios: await prisma.horarioApertura.count(),
      cierres: await prisma.cierre.count(), reservas: await prisma.reserva.count(),
      actividades: await prisma.actividad.count(), sesiones: await prisma.sesion.count(),
    };
    assert.deepEqual(totales, {
      usuarios: 8, centros: 5, espacios: 7, horarios: 20,
      cierres: 5, reservas: 12, actividades: 5, sesiones: 8,
    }, "En una base de CI vacía, repetir el seed debe mantener exactamente sus ejemplos");
    const usuarios = await prisma.usuario.findMany();
    assert.equal(usuarios.filter((usuario) => usuario.nombre === "Ana Pruebas").length, 2);
    assert.equal(new Set(usuarios.map((usuario) => usuario.rol)).size, 3);
    assert.ok(usuarios.some((usuario) => !usuario.activo));
    assert.ok(usuarios.every((usuario) => usuario.email.endsWith("@example.test")));

    const reservas = await prisma.reserva.findMany({ include: { solicitante: true, resueltaPor: true } });
    assert.deepEqual(new Set(reservas.map((reserva) => reserva.estado)), new Set(Object.values(EstadoReserva)));
    for (const reserva of reservas) {
      assert.ok(reserva.inicio < reserva.fin);
      if (reserva.estado === EstadoReserva.PENDIENTE) {
        assert.equal(reserva.resueltaPorId, null);
        assert.equal(reserva.resueltaEn, null);
      } else {
        assert.ok(reserva.resueltaPor && reserva.resueltaEn);
        assert.ok(reserva.resueltaEn < reserva.inicio);
        if (reserva.estado === EstadoReserva.CONFIRMADA || reserva.estado === EstadoReserva.RECHAZADA) {
          assert.notEqual(reserva.solicitanteId, reserva.resueltaPorId);
          assert.ok(["GESTOR", "ADMIN"].includes(reserva.resueltaPor.rol));
        }
        if (reserva.estado === EstadoReserva.RECHAZADA || reserva.estado === EstadoReserva.CANCELADA) {
          assert.ok(reserva.motivoResolucion?.trim());
        }
      }
    }
    const sesiones = await prisma.sesion.findMany();
    const cierres = await prisma.cierre.findMany();
    assert.ok(sesiones.some((sesion) => sesion.estado === EstadoSesion.CANCELADA));
    assert.ok(cierres.some((cierre) => !cierre.activo));
    assert.ok(cierres.every((cierre) => cierre.inicio < cierre.fin));
    assert.ok(sesiones.every((sesion) => sesion.inicio < sesion.fin));
    const ocupaciones = [
      ...reservas.filter((reserva) => reserva.estado === EstadoReserva.CONFIRMADA),
      ...sesiones.filter((sesion) => sesion.estado === EstadoSesion.PROGRAMADA),
    ];
    for (let i = 0; i < ocupaciones.length; i++) {
      const uso = ocupaciones[i];
      for (const otro of ocupaciones.slice(i + 1)) {
        assert.ok(uso.espacioId !== otro.espacioId || uso.inicio >= otro.fin || uso.fin <= otro.inicio,
          `Ocupaciones confirmadas incompatibles: ${uso.id} y ${otro.id}`);
      }
      for (const cierre of cierres.filter((cierre) => cierre.activo)) {
        assert.ok(uso.espacioId !== cierre.espacioId || uso.inicio >= cierre.fin || uso.fin <= cierre.inicio,
          `Ocupación ${uso.id} incompatible con cierre ${cierre.id}`);
      }
    }
    assert.ok(await prisma.centro.findFirst({ where: { espacios: { none: {} } } }));
    assert.ok(await prisma.actividad.findFirst({ where: { sesiones: { none: {} } } }));
    assert.ok(await prisma.espacio.findFirst({ where: { activo: true, horarios: { none: {} } } }));
    console.table(totales);
    console.log("Seed completo comprobado en base de CI: estados, relaciones, vacíos y ocupaciones sin conflictos confirmados.");
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
