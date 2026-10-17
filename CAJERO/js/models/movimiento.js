export class Movimiento {
    // Nivel 2 · Encapsulamiento REAL con campos privados (#)
    #fecha;
    #tipo;
    #valor;
    #numeroCuenta;
    #clienteIdentificacion;

    // La fecha es opcional: si no se pasa, el movimiento nace con la fecha actual.
    constructor(tipo, valor, numeroCuenta, clienteIdentificacion, fecha = new Date()) {
        this.#tipo = tipo;
        this.#valor = valor;
        this.#numeroCuenta = numeroCuenta;
        this.#clienteIdentificacion = clienteIdentificacion;
        this.#fecha = fecha ? new Date(fecha) : new Date();
    }

    /* ------------ Accesores: la única puerta hacia los campos ------------- */

    get fecha() {
        return this.#fecha;
    }

    get tipo() {
        return this.#tipo;
    }

    get valor() {
        return this.#valor;
    }

    get numeroCuenta() {
        return this.#numeroCuenta;
    }

    get clienteIdentificacion() {
        return this.#clienteIdentificacion;
    }
}
