import { Cuenta } from "./cuenta.js";

export class CuentaAhorros extends Cuenta {
    // Tasa mensual de rendimiento: 1.5%
    static TASA_INTERES_MENSUAL = 0.015;

    constructor(numero, saldo, clienteIdentificacion) {
        super("ahorros", numero, saldo, clienteIdentificacion);
    }

    // Tope de retiro: saldo + el interés del 1.5%.
    calcularMontoMaximoRetiro() {
        return this.saldo * (1 + CuentaAhorros.TASA_INTERES_MENSUAL);
    }

    // Suma el interés mensual al saldo antes de retirar.
    aplicarReglasPrevioRetiro() {
        const interes = this.saldo * CuentaAhorros.TASA_INTERES_MENSUAL;
        this.saldo = this.saldo + interes;
        return { interesAplicado: interes };
    }
}
