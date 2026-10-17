// Pruebas rápidas para compra y abono con Tarjeta de Crédito
import { localStorageMock, resetStorage } from "./mock-storage.mjs";
global.localStorage = localStorageMock;

import { registrarCliente, comprarConTarjeta, abonarTarjeta, obtenerTarjetas, calcularCuotaTarjeta } from "../js/service/servicios.js";

let p = 0, e = 0;
function ok(c, m) { p++; if (!c) { e++; console.error("✗", m); } else console.log("✓", m); }

resetStorage();

// Registro
let r = registrarCliente("333", "Leo", "300", "leo@test.com", "leo", "123", "123");
ok(r.exito, "Registro Leo OK");

// Obtener tarjeta
let tar = obtenerTarjetas("333");
ok(tar.exito && tar.tarjetas.length === 1, "Tarjeta creada OK");
const tcNum = tar.tarjetas[0].numero;

// Compra con 6 cuotas (tasa 1.9%)
let comp = comprarConTarjeta("333", tcNum, 600000, 6);
ok(comp.exito, "Compra aprobada OK");
ok(comp.cuotaMensual > 0, "Cuota mensual calculada OK");
ok(comp.deudaNueva === 600000, "Deuda actualizada OK");
ok(comp.cupoDisponible === 2000000 - 600000, "Cupo disponible actualizado OK");

// Abono parcial
let abo = abonarTarjeta("333", tcNum, 200000);
ok(abo.exito, "Abono parcial OK");
ok(abo.deudaNueva === 400000, "Deuda reducida OK");

// No permite abonar más de lo que debe
abo = abonarTarjeta("333", tcNum, 500000);
ok(!abo.exito, "No permite abonar más de la deuda");

// No permite compra > cupo
comp = comprarConTarjeta("333", tcNum, 3000000, 12);
ok(!comp.exito && comp.mensaje.includes("Cupo insuficiente"), "Cupo insuficiente rechazado");

// No permite monto <= 0
comp = comprarConTarjeta("333", tcNum, 0, 3);
ok(!comp.exito, "Monto <= 0 rechazado");

// No permite cuotas no enteras / < 1
comp = comprarConTarjeta("333", tcNum, 10000, 0);
ok(!comp.exito, "Cuotas < 1 rechazadas");
comp = comprarConTarjeta("333", tcNum, 10000, 2.5);
ok(!comp.exito, "Cuotas no enteras rechazadas");

// Vista previa de cuota (no modifica la deuda)
const deudaAntes = obtenerTarjetas("333").tarjetas[0].deuda;
let prev = calcularCuotaTarjeta(tcNum, 120000, 12);
ok(prev.exito && prev.cuotaMensual > 0, "Cuota estimada calculada OK");
ok(prev.tasa === 0.023, "Tasa 12 cuotas = 2.3%");
prev = calcularCuotaTarjeta(tcNum, 100000, 2);
ok(prev.exito && prev.tasa === 0, "Tasa 2 cuotas = 0%");
prev = calcularCuotaTarjeta(tcNum, -5, 3);
ok(!prev.exito, "Vista previa rechaza capital inválido");
ok(obtenerTarjetas("333").tarjetas[0].deuda === deudaAntes, "La vista previa no modifica la deuda");

console.log(`\nTC: ${p} pruebas, ${e} errores`);
if (e) process.exit(1);
