export class TarjetaCredito{
    
    static DOS_CUOTAS = 0;
    static TRES_A_SEIS_CUOTAS = 0.019;
    static SIETE_O_MAS_CUOTAS = 0.023;

    #numero;
    #cupo;
    #deuda;
    #clienteIdentificacion

    constructor(numero, cupo, clienteIdentificacion) {
        this.#numero = numero;
        this.#cupo = cupo;
        this.#deuda = 0;
        this.#clienteIdentificacion = clienteIdentificacion;
    }

    cupoDisponible() {
        const cupoTotal = this.#cupo;
        const deudaActual = this.#deuda;
        return cupoTotal - deudaActual;
    }

    calcularTasa(cuotas) {
        if(cuotas <= 2){
            return TarjetaCredito.DOS_CUOTAS;
        } else if(cuotas >= 3 && cuotas <= 6) {
            return TarjetaCredito.TRES_A_SEIS_CUOTAS;    
        } else if (cuotas >= 7) {
            return  TarjetaCredito.SIETE_O_MAS_CUOTAS;
        }
    }

    calcularCuotaMensual(capital, cuotas) {
        const tasa = this.calcularTasa(cuotas);
        if( tasa === 0 ) {
            return capital / cuotas
        } else {
            return (capital * tasa) / (1 - Math.pow(1 + tasa, -cuotas));
        }
    }

    realizarCompra(capital, cuotas) {
        // 1. Validar capital: número y mayor que cero
        if (capital === null || capital === undefined || isNaN(capital) || capital <= 0) {
            return {
                exito: false,
                mensaje: "El capital debe ser un número mayor a cero."
            };
        }

        // 2. Validar cuotas: entero mayor o igual a 1
        if (!Number.isInteger(cuotas) || cuotas < 1) {
            return {
                exito: false,
                mensaje: "El número de cuotas debe ser un entero mayor o igual a 1."
            };
        }

        // 3. Validar cupo disponible
        if (capital > this.cupoDisponible()) {
            return {
                exito: false,
                mensaje: "Cupo insuficiente. Disponible: $" + this.cupoDisponible()
            };
        }

        // 4. Calcular tasa y cuota mensual
        const tasa = this.calcularTasa(cuotas);
        const cuotaMensual = this.calcularCuotaMensual(capital, cuotas);

        // 5. La compra se suma a la deuda
        this.#deuda = this.#deuda + capital;

        // 6. Responder éxito mostrando SIEMPRE el pago mensual (requisito del PDF)
        return {
            exito: true,
            mensaje: "Compra aprobada.",
            capital,
            cuotas,
            tasa,
            cuotaMensual,
            deudaNueva: this.#deuda
        };
    }
}