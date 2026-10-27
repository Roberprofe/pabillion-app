import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  DiaSemana,
  EstadoReserva,
  EstadoSesion,
  Prisma,
  PrismaClient,
  RolUsuario,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Falta DATABASE_URL en .env");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 }),
});

// IDs estables: repetir el seed no duplica ni restaura lo que hayáis editado.
// Reutilizamos también las claves naturales del antiguo seed de Centro/Espacio.
async function centro(tx: Prisma.TransactionClient, clave: string, nombre: string, activo = true) {
  const id = `seed-centro-${clave}`;
  const existente = await tx.centro.findUnique({ where: { id } });
  if (existente) return existente;
  return tx.centro.upsert({
    where: { nombre },
    update: {},
    create: { id, nombre, activo },
  });
}

async function espacio(tx: Prisma.TransactionClient, clave: string, centroId: string, nombre: string, activo = true) {
  const id = `seed-espacio-${clave}`;
  const existente = await tx.espacio.findUnique({ where: { id } });
  if (existente) return existente;
  return tx.espacio.upsert({
    where: { centroId_nombre: { centroId, nombre } },
    update: {},
    create: { id, centroId, nombre, activo },
  });
}

async function usuario(tx: Prisma.TransactionClient, clave: string, nombre: string, rol: RolUsuario = RolUsuario.USUARIO, activo = true) {
  const id = `seed-usuario-${clave}`;
  const existente = await tx.usuario.findUnique({ where: { id } });
  if (existente) return existente;
  const email = `${clave}@example.test`;
  return tx.usuario.upsert({
    where: { email },
    update: {},
    create: { id, nombre, email, rol, activo },
  });
}

async function horario(tx: Prisma.TransactionClient, clave: string, espacioId: string, diaSemana: DiaSemana, inicioMinuto: number, finMinuto: number) {
  const id = `seed-horario-${clave}`;
  if (await tx.horarioApertura.findUnique({ where: { id } })) return;
  await tx.horarioApertura.upsert({
    where: { espacioId_diaSemana_inicioMinuto: { espacioId, diaSemana, inicioMinuto } },
    update: {},
    create: { id, espacioId, diaSemana, inicioMinuto, finMinuto },
  });
}

// Fechas fijas de prácticas: 2–8 de noviembre de 2026, Europe/Madrid (UTC+1).
// No usar este offset fijo como conversión general para todo el año.
function fecha(dia: number, hora: string) {
  return new Date(`2026-11-${String(dia).padStart(2, "0")}T${hora}:00+01:00`);
}

async function poblar(tx: Prisma.TransactionClient) {
  await usuario(tx, "admin", "Administración Pruebas", RolUsuario.ADMIN);
  const recepcion = await usuario(tx, "recepcion", "Recepción Pruebas", RolUsuario.GESTOR);
  const coordinacion = await usuario(tx, "coordinacion", "Coordinación Pruebas", RolUsuario.GESTOR);
  const ana = await usuario(tx, "ana", "Ana Pruebas");
  const otraAna = await usuario(tx, "ana2", "Ana Pruebas");
  const brais = await usuario(tx, "brais", "Brais Pruebas");
  const club = await usuario(tx, "club", "Club ficticio Lúa");
  const retirado = await usuario(tx, "inactivo", "Usuario retirado Pruebas", RolUsuario.USUARIO, false);

  const lua = await centro(tx, "lua", "Centro Lúa (ejemplo)");
  const mar = await centro(tx, "mar", "Centro Mar (ejemplo)");
  await centro(tx, "sin-espacios", "Centro sen espazos (ejemplo)");
  const archivo = await centro(tx, "archivo", "Centro Arquivo (ejemplo)", false);
  const reformas = await centro(tx, "reformas", "Centro Reformas (ejemplo)");

  const pista = await espacio(tx, "lua-pista", lua.id, "Pista 1");
  const sala = await espacio(tx, "lua-sala", lua.id, "Sala 2");
  const piscina = await espacio(tx, "mar-piscina", mar.id, "Piscina");
  await espacio(tx, "mar-sin-horario", mar.id, "Sala sen horario");
  const exterior = await espacio(tx, "mar-exterior", mar.id, "Pista exterior", false);
  await espacio(tx, "archivo-pista", archivo.id, "Pista 1");
  await espacio(tx, "reformas-sala", reformas.id, "Sala en reforma", false);

  const laborables = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES];
  for (const dia of laborables) {
    await horario(tx, `pista-${dia}`, pista.id, dia, 540, 1320);
    await horario(tx, `piscina-${dia}`, piscina.id, dia, 480, 1260);
    if (dia === DiaSemana.LUNES || dia === DiaSemana.MIERCOLES) {
      await horario(tx, `sala-${dia}-manana`, sala.id, dia, 540, 840);
      await horario(tx, `sala-${dia}-tarde`, sala.id, dia, 960, 1320);
    } else {
      await horario(tx, `sala-${dia}`, sala.id, dia, 540, 1320);
    }
  }
  await horario(tx, "pista-SABADO", pista.id, DiaSemana.SABADO, 600, 840);
  await horario(tx, "sala-SABADO", sala.id, DiaSemana.SABADO, 600, 840);
  await horario(tx, "piscina-SABADO", piscina.id, DiaSemana.SABADO, 540, 840);

  const cierres = [
    { id: "seed-cierre-pista-mantenimiento", espacioId: pista.id, inicio: fecha(2, "19:00"), fin: fecha(2, "20:00"), motivo: "Mantenimiento de iluminación", activo: true },
    { id: "seed-cierre-sala-revision", espacioId: sala.id, inicio: fecha(3, "16:00"), fin: fecha(3, "18:00"), motivo: "Revisión del suelo", activo: true },
    { id: "seed-cierre-piscina-limpieza", espacioId: piscina.id, inicio: fecha(4, "09:00"), fin: fecha(4, "12:00"), motivo: "Limpieza extraordinaria", activo: true },
    { id: "seed-cierre-pista-anulado", espacioId: pista.id, inicio: fecha(2, "20:00"), fin: fecha(2, "21:00"), motivo: "Revisión aplazada: cierre anulado", activo: false },
    { id: "seed-cierre-exterior-varios-dias", espacioId: exterior.id, inicio: fecha(6, "16:00"), fin: fecha(8, "22:00"), motivo: "Reparación de cubierta durante el fin de semana", activo: true },
  ] satisfies Prisma.CierreUncheckedCreateInput[];
  for (const create of cierres) {
    await tx.cierre.upsert({ where: { id: create.id }, update: {}, create });
  }

  const actividades = [
    { id: "seed-actividad-badminton", nombre: "Bádminton inicial (ejemplo)", descripcion: "Iniciación con sesiones independientes.", activo: true },
    { id: "seed-actividad-yoga", nombre: "Yoga (ejemplo)", descripcion: null, activo: true },
    { id: "seed-actividad-natacion", nombre: "Natación (ejemplo)", descripcion: "Prácticas en piscina.", activo: true },
    { id: "seed-actividad-sin-sesiones", nombre: "Actividad por planificar (ejemplo)", descripcion: null, activo: true },
    { id: "seed-actividad-retirada", nombre: "Curso retirado (ejemplo)", descripcion: "Se conserva su sesión cancelada.", activo: false },
  ] satisfies Prisma.ActividadCreateInput[];
  for (const create of actividades) {
    await tx.actividad.upsert({ where: { id: create.id }, update: {}, create });
  }

  const sesiones = [
    { id: "seed-sesion-badminton-lunes", actividadId: "seed-actividad-badminton", espacioId: pista.id, inicio: fecha(2, "18:00"), fin: fecha(2, "19:00"), estado: EstadoSesion.PROGRAMADA },
    { id: "seed-sesion-badminton-miercoles", actividadId: "seed-actividad-badminton", espacioId: pista.id, inicio: fecha(4, "18:00"), fin: fecha(4, "19:00"), estado: EstadoSesion.PROGRAMADA },
    { id: "seed-sesion-badminton-cancelada", actividadId: "seed-actividad-badminton", espacioId: pista.id, inicio: fecha(6, "18:00"), fin: fecha(6, "19:00"), estado: EstadoSesion.CANCELADA },
    { id: "seed-sesion-yoga-lunes", actividadId: "seed-actividad-yoga", espacioId: sala.id, inicio: fecha(2, "16:00"), fin: fecha(2, "17:00"), estado: EstadoSesion.PROGRAMADA },
    { id: "seed-sesion-yoga-jueves", actividadId: "seed-actividad-yoga", espacioId: sala.id, inicio: fecha(5, "16:00"), fin: fecha(5, "17:00"), estado: EstadoSesion.PROGRAMADA },
    { id: "seed-sesion-natacion-martes", actividadId: "seed-actividad-natacion", espacioId: piscina.id, inicio: fecha(3, "09:00"), fin: fecha(3, "10:00"), estado: EstadoSesion.PROGRAMADA },
    { id: "seed-sesion-natacion-jueves", actividadId: "seed-actividad-natacion", espacioId: piscina.id, inicio: fecha(5, "09:00"), fin: fecha(5, "10:00"), estado: EstadoSesion.PROGRAMADA },
    { id: "seed-sesion-curso-retirado", actividadId: "seed-actividad-retirada", espacioId: piscina.id, inicio: fecha(2, "10:00"), fin: fecha(2, "11:00"), estado: EstadoSesion.CANCELADA },
  ] satisfies Prisma.SesionUncheckedCreateInput[];
  for (const create of sesiones) {
    await tx.sesion.upsert({ where: { id: create.id }, update: {}, create });
  }

  const resueltaEn = new Date("2026-10-30T10:00:00Z");
  const reservas = [
    { id: "seed-reserva-confirmada-ana", espacioId: pista.id, solicitanteId: ana.id, inicio: fecha(2, "17:00"), fin: fecha(2, "18:00"), estado: EstadoReserva.CONFIRMADA, resueltaPorId: recepcion.id, resueltaEn },
    // Pendientes con conflicto: válidas como petición, no confirmables sin resolverlo.
    { id: "seed-reserva-pendiente-solapada", espacioId: pista.id, solicitanteId: brais.id, inicio: fecha(2, "17:30"), fin: fecha(2, "18:30"), estado: EstadoReserva.PENDIENTE },
    { id: "seed-reserva-confirmada-otra-ana", espacioId: pista.id, solicitanteId: otraAna.id, inicio: fecha(2, "16:00"), fin: fecha(2, "17:00"), estado: EstadoReserva.CONFIRMADA, resueltaPorId: coordinacion.id, resueltaEn },
    { id: "seed-reserva-rechazada-cierre", espacioId: pista.id, solicitanteId: club.id, inicio: fecha(2, "19:30"), fin: fecha(2, "20:30"), estado: EstadoReserva.RECHAZADA, resueltaPorId: recepcion.id, resueltaEn, motivoResolucion: "Coincide con el cierre por mantenimiento." },
    { id: "seed-reserva-cancelada-ana", espacioId: pista.id, solicitanteId: ana.id, inicio: fecha(2, "20:00"), fin: fecha(2, "21:00"), estado: EstadoReserva.CANCELADA, resueltaPorId: ana.id, resueltaEn, motivoResolucion: "La solicitante ya no necesita la pista." },
    { id: "seed-reserva-pendiente-sala", espacioId: sala.id, solicitanteId: otraAna.id, inicio: fecha(2, "10:00"), fin: fecha(2, "11:00"), estado: EstadoReserva.PENDIENTE },
    { id: "seed-reserva-confirmada-club", espacioId: sala.id, solicitanteId: club.id, inicio: fecha(2, "11:00"), fin: fecha(2, "12:00"), estado: EstadoReserva.CONFIRMADA, resueltaPorId: recepcion.id, resueltaEn },
    { id: "seed-reserva-rechazada-sala", espacioId: sala.id, solicitanteId: brais.id, inicio: fecha(3, "16:30"), fin: fecha(3, "17:30"), estado: EstadoReserva.RECHAZADA, resueltaPorId: coordinacion.id, resueltaEn, motivoResolucion: "La sala estará cerrada por revisión." },
    { id: "seed-reserva-confirmada-piscina", espacioId: piscina.id, solicitanteId: ana.id, inicio: fecha(3, "10:00"), fin: fecha(3, "11:00"), estado: EstadoReserva.CONFIRMADA, resueltaPorId: recepcion.id, resueltaEn },
    { id: "seed-reserva-pendiente-piscina", espacioId: piscina.id, solicitanteId: brais.id, inicio: fecha(4, "10:00"), fin: fecha(4, "11:00"), estado: EstadoReserva.PENDIENTE },
    { id: "seed-reserva-cancelada-inactivo", espacioId: sala.id, solicitanteId: retirado.id, inicio: fecha(2, "18:00"), fin: fecha(2, "19:00"), estado: EstadoReserva.CANCELADA, resueltaPorId: recepcion.id, resueltaEn, motivoResolucion: "Petición cancelada; se conserva el usuario inactivo para mantener el historial." },
    { id: "seed-reserva-pendiente-gestor", espacioId: pista.id, solicitanteId: coordinacion.id, inicio: fecha(6, "17:00"), fin: fecha(6, "18:00"), estado: EstadoReserva.PENDIENTE },
  ] satisfies Prisma.ReservaUncheckedCreateInput[];
  for (const create of reservas) {
    await tx.reserva.upsert({ where: { id: create.id }, update: {}, create });
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("El seed es solo para prácticas: no se ejecuta con NODE_ENV=production.");
  }
  const destino = new URL(connectionString!);
  if (!["localhost", "127.0.0.1", "[::1]", "postgres"].includes(destino.hostname)) {
    throw new Error("El seed solo permite PostgreSQL local (localhost, 127.0.0.1, ::1 o servicio Docker postgres).");
  }
  console.log("Cargando ejemplos de prácticas sin borrar ni actualizar registros existentes...");
  await prisma.$transaction(poblar, { maxWait: 5_000, timeout: 30_000 });
  console.table({
    usuarios: await prisma.usuario.count(),
    centros: await prisma.centro.count(),
    espacios: await prisma.espacio.count(),
    horarios: await prisma.horarioApertura.count(),
    cierres: await prisma.cierre.count(),
    reservas: await prisma.reserva.count(),
    actividades: await prisma.actividad.count(),
    sesiones: await prisma.sesion.count(),
  });
  console.log("Totales de esta base, incluidos vuestros datos. Fechas de ejemplo: 2–8/11/2026. No se han creado cuentas de login.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
