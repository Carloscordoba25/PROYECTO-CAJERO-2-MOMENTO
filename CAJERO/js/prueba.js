// js/prueba.js — Módulo de prueba (TEMPORAL).
// Sirve únicamente para comprobar que los módulos ES cargan bien.
// Bórralo cuando ya tengas los controladores reales (registro.js, login.js...).
import { Cliente } from "./modelos/cliente.js";
import { CuentaAhorros } from "./modelos/cuenta-ahorros.js";
import { CuentaCorriente } from "./modelos/cuenta-corriente.js";
import { TarjetaCredito } from "./modelos/tarjeta-credito.js";

const cliente = new Cliente("123", "Juan Perez", "3001234567", "juan", "clave123");
const ahorros = new CuentaAhorros("A001", 1000000, "123");
const corriente = new CuentaCorriente("C001", 1000000, "123");
const tarjeta = new TarjetaCredito("TC001", 2000000, "123");

console.log("✅ Módulos cargados correctamente");
console.log("Cliente:", cliente.nombre, "- estado:", cliente.estado);
console.log("Tope ahorros:   $", ahorros.calcularMontoMaximoRetiro());
console.log("Tope corriente: $", corriente.calcularMontoMaximoRetiro());
console.log("Cuota 6 cuotas de $1.200.000:", tarjeta.calcularCuotaMensual(1200000, 6));