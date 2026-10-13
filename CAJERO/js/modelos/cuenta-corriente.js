import { Cuenta } from "./cuenta.js";

export class CuentaCorriente extends Cuenta {
    // La Cuenta Corriente NO genera intereses: permite SOBREGIRO del 20%.
    static PORCENTAJE_SOBREGIRO = 0.20;

    constructor(numero, saldo, clienteIdentificacion) {
        super("corriente", numero, saldo, clienteIdentificacion);
    }

    // Tope de retiro: 100% del saldo + 20% de sobregiro → saldo × 1.20.
    calcularMontoMaximoRetiro() {
        return this.saldo * (1 + CuentaCorriente.PORCENTAJE_SOBREGIRO);
    }

    
}