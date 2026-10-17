export class Cuenta {
    // Nivel 2 · Encapsulamiento REAL: campos privados (#)
    #tipo;
    #numero;
    #saldo;
    #clienteIdentificacion;

    constructor(tipo, numero, saldo, clienteIdentificacion) {
        this.#tipo = tipo;
        this.#numero = numero;
        this.#saldo = saldo;
        this.#clienteIdentificacion = clienteIdentificacion;
    }

    /* ------------ Accesores: la única forma de entrar y salir ------------- */

    // Lectura permitida para todos
    get tipo() {
        return this.#tipo;
    }

    get numero() {
        return this.#numero;
    }

    get clienteIdentificacion() {
        return this.#clienteIdentificacion;
    }

    // saldo necesita getter Y setter porque las clases hijas (Ahorros/Corriente)
    // lo ajustan a través de *this.saldo* (el accesor), no del campo privado.
    get saldo() {
        return this.#saldo;
    }
    set saldo(valor) {
        this.#saldo = valor;
    }

    /* ---------------------------- Operaciones ----------------------------- */

    // Devuelve el saldo actual de la cuenta.
    consultarSaldo() {
        return this.#saldo;
    }

    // Suma un monto al saldo; rechaza montos nulos o menores/iguales a cero.
    consignar(monto) {
        if (monto === null || monto === undefined || isNaN(monto) || monto <= 0) {
            return { exito: false, mensaje: "El monto a consignar debe ser un número mayor a cero." };
        }
        this.#saldo += monto;
        return {
            exito: true,
            mensaje: "Consignación exitosa.",
            monto,
            saldoNuevo: this.#saldo
        };
    }

    // Resta un monto al saldo si no supera el tope; aplica la regla de cada hija.
    retirar(monto) {
        if (monto === null || monto === undefined || isNaN(monto) || monto <= 0) {
            return { exito: false, mensaje: "El monto a retirar debe ser un número mayor a cero." };
        }

        // El tope lo define cada tipo de cuenta (polimorfismo).
        const tope = this.calcularMontoMaximoRetiro();
        if (monto > tope) {
            return {
                exito: false,
                mensaje: "Saldo insuficiente. El máximo que puedes retirar es $" + tope.toFixed(2)
            };
        }

        const saldoAnterior = this.#saldo;

        // Gancho polimórfico: las hijas (Ahorros/Corriente) aplican su regla aquí.
        const { interesAplicado } = this.aplicarReglasPrevioRetiro();

        this.#saldo -= monto;

        return {
            exito: true,
            mensaje: "Retiro exitoso.",
            saldoAnterior,
            monto,
            interesAplicado,
            saldoNuevo: this.#saldo
        };
    }

    // Tope de retiro de la cuenta base (cada hija lo redefine).
    calcularMontoMaximoRetiro() {
        return this.#saldo;
    }

    // Gancho polimórfico: por defecto no aplica ninguna regla antes de retirar.
    aplicarReglasPrevioRetiro() {
        return { interesAplicado: 0 };
    }

    // Salida de dinero por transferencia (reutiliza el retiro).
    transferirSalida(monto) {
        return this.retirar(monto);
    }

    // Entrada de dinero por transferencia: suma el abono recibido al saldo.
    transferirEntrada(monto) {
        if (monto === null || monto === undefined || isNaN(monto) || monto <= 0) {
            return { exito: false, mensaje: "El monto a transferir debe ser un número mayor a cero." };
        }
        this.#saldo += monto;
        return {
            exito: true,
            mensaje: "Abono recibido.",
            monto,
            saldoNuevo: this.#saldo
        };
    }
}
