// Controlador para gestionar la Tarjeta de Crédito
import { leerSesion } from "../config/persistencia.js";
import { obtenerTarjetas, comprarConTarjeta, abonarTarjeta, calcularCuotaTarjeta } from "../service/servicios.js";

const sesion = leerSesion();
const cuerpoTarjetas = document.querySelector("#cuerpo-tarjetas");
const formCompra = document.querySelector("#form-compra-tarjeta");
const formAbono = document.querySelector("#form-abono-tarjeta");
const mensajeTC = document.querySelector("#mensaje-tarjeta");
const tarjetaSeleccionadaCompra = document.querySelector("#tarjeta-seleccionada");
const tarjetaSeleccionadaAbono = document.querySelector("#tarjeta-abono");
const mostrarCuota = document.querySelector("#mostrar-cuota");

function formatearPesos(valor) {
    return Number(valor).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP"
    });
}

function inicializar() {
    if (!sesion || !sesion.identificacion) {
        window.location.href = "iniciar-sesion.html";
        return;
    }

    actualizarTarjetas();
    actualizarSelectores();

    if (formCompra) {
        formCompra.addEventListener("submit", comprar);
    }

    if (formAbono) {
        formAbono.addEventListener("submit", abonar);
    }

    const capitalInput = document.querySelector("#capital-compra");
    const cuotasInput = document.querySelector("#cuotas-compra");
    if (capitalInput && cuotasInput && mostrarCuota) {
        capitalInput.addEventListener("input", calcularCuota);
        cuotasInput.addEventListener("input", calcularCuota);
    }
}

function actualizarTarjetas() {
    if (!cuerpoTarjetas) {
        return;
    }

    const respuesta = obtenerTarjetas(sesion.identificacion);
    if (!respuesta.exito) {
        cuerpoTarjetas.replaceChildren();
        return;
    }

    cuerpoTarjetas.replaceChildren();

    if (respuesta.tarjetas.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 4;
        celda.textContent = "No tienes tarjetas registradas.";
        fila.appendChild(celda);
        cuerpoTarjetas.appendChild(fila);
        return;
    }

    respuesta.tarjetas.forEach(tarjeta => {
        const fila = document.createElement("tr");
        const celdaNumero = document.createElement("td");
        celdaNumero.textContent = tarjeta.numero;
        const celdaCupo = document.createElement("td");
        celdaCupo.textContent = formatearPesos(tarjeta.cupo);
        const celdaDeuda = document.createElement("td");
        celdaDeuda.textContent = formatearPesos(tarjeta.deuda);
        const celdaDisponible = document.createElement("td");
        celdaDisponible.textContent = formatearPesos(tarjeta.cupo - tarjeta.deuda);
        fila.appendChild(celdaNumero);
        fila.appendChild(celdaCupo);
        fila.appendChild(celdaDeuda);
        fila.appendChild(celdaDisponible);
        cuerpoTarjetas.appendChild(fila);
    });
}

function actualizarSelectores() {
    const respuesta = obtenerTarjetas(sesion.identificacion);
    if (!respuesta.exito || respuesta.tarjetas.length === 0) {
        return;
    }

    if (tarjetaSeleccionadaCompra) {
        tarjetaSeleccionadaCompra.replaceChildren();
        respuesta.tarjetas.forEach(tarjeta => {
            const opcion = document.createElement("option");
            opcion.value = tarjeta.numero;
            opcion.textContent = tarjeta.numero;
            tarjetaSeleccionadaCompra.appendChild(opcion);
        });
    }

    if (tarjetaSeleccionadaAbono) {
        tarjetaSeleccionadaAbono.replaceChildren();
        respuesta.tarjetas.forEach(tarjeta => {
            const opcion = document.createElement("option");
            opcion.value = tarjeta.numero;
            opcion.textContent = tarjeta.numero;
            tarjetaSeleccionadaAbono.appendChild(opcion);
        });
    }
}

function calcularCuota() {
    if (!mostrarCuota) {
        return;
    }

    const capital = document.querySelector("#capital-compra")?.value || "";
    const cuotas = document.querySelector("#cuotas-compra")?.value || "";
    const numero = tarjetaSeleccionadaCompra?.value || "";

    const respuesta = calcularCuotaTarjeta(numero, capital, cuotas);

    if (!respuesta.exito) {
        mostrarCuota.textContent = "";
        return;
    }

    mostrarCuota.textContent = "Cuota mensual estimada: " + formatearPesos(respuesta.cuotaMensual)
        + " (tasa " + (respuesta.tasa * 100).toFixed(2) + "%)";
}

function comprar(e) {
    e.preventDefault();
    if (!mensajeTC) {
        return;
    }

    const numeroTarjeta = tarjetaSeleccionadaCompra?.value || "";
    const capital = document.querySelector("#capital-compra")?.value || "";
    const cuotas = document.querySelector("#cuotas-compra")?.value || "";

    const respuesta = comprarConTarjeta(sesion.identificacion, numeroTarjeta, capital, cuotas);
    mensajeTC.textContent = respuesta.mensaje;
    mensajeTC.style.color = respuesta.exito ? "#166534" : "#991b1b";

    if (respuesta.exito) {
        e.target.reset();
        if (mostrarCuota) {
            mostrarCuota.textContent = "";
        }
        actualizarTarjetas();
        actualizarSelectores();
    }
}

function abonar(e) {
    e.preventDefault();
    if (!mensajeTC) {
        return;
    }

    const numeroTarjeta = tarjetaSeleccionadaAbono?.value || "";
    const monto = document.querySelector("#monto-abono")?.value || "";

    const respuesta = abonarTarjeta(sesion.identificacion, numeroTarjeta, monto);
    mensajeTC.textContent = respuesta.mensaje;
    mensajeTC.style.color = respuesta.exito ? "#166534" : "#991b1b";

    if (respuesta.exito) {
        e.target.reset();
        actualizarTarjetas();
        actualizarSelectores();
    }
}

inicializar();
