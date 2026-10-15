import { Cuenta } from "./cuenta.js";

export class CuentaAhorros extends Cuenta {
    // Tasa mensual de rendimiento: 1.5%
    static TASA_INTERES_MENSUAL = 0.015;

    constructor(numero, saldo, clienteIdentificacion) {
        super("ahorros", numero, saldo, clienteIdentificacion);
    }

    calcularMontoMaximoRetiro() {
        return this.saldo * (1 + CuentaAhorros.TASA_INTERES_MENSUAL);
    }

    aplicarReglasPrevioRetiro() {
        const interes = this.saldo * CuentaAhorros.TASA_INTERES_MENSUAL;
        this.saldo = this.saldo + interes;
        return { interesAplicado: interes };
    }
}