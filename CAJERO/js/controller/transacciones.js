import { leerSesion } from "../config/persistencia.js";
import { obtenerCuentas, consignar, retirar, transferir, listarMovimientos } from "../service/servicios.js";

// Referencias a la sesión y a los controles usados en las transacciones.
const sesion = leerSesion();
const cuentaSeleccionada = document.querySelector("#cuenta-seleccionada");
const saldoCuenta = document.querySelector(".valor-saldo");
const cuentaOrigen = document.querySelector("#cuenta-origen");
const cuentaDestino = document.querySelector("#cuenta-destino");
const tipoDestino = document.querySelector("#tipo-destino");
const identificacionDestino = document.querySelector("#identificacion-destino");
const grupoIdentificacionDestino = identificacionDestino.closest(".grupo-entrada");
const cuerpoMovimientos = document.querySelector("#cuerpo-movimientos");

let cuentasUsuario = [];
let cuentasDestinoExterno = [];

// Impide el acceso al panel si no existe una sesión iniciada.
if (!sesion || !sesion.identificacion) {
    alert("Debes iniciar sesión para consultar y realizar transacciones.");
    window.location.replace("iniciar-sesion.html");
} else {
    inicializarTransacciones();
}

// Carga las cuentas del usuario y enlaza los formularios con las operaciones.
function inicializarTransacciones() {
    const respuesta = obtenerCuentas(sesion.identificacion);

    if (!respuesta.exito) {
        alert(respuesta.mensaje);
        return;
    }

    cuentasUsuario = respuesta.cuentas;
    actualizarSelectores();
    actualizarSaldo();
    actualizarDestino();
    actualizarMovimientos();

    document.querySelector("#cuenta-seleccionada").addEventListener("change", actualizarSaldo);
    cuentaOrigen.addEventListener("change", actualizarDestino);
    tipoDestino.addEventListener("change", cambiarTipoDestino);
    identificacionDestino.addEventListener("change", cargarCuentasDestinoExterno);

    document.querySelector("#consignar-dinero form").addEventListener("submit", evento => {
        procesarOperacion(evento, consignar, cuentaSeleccionada.value, "#monto-consignacion");
    });
    document.querySelector("#retirar-dinero form").addEventListener("submit", evento => {
        procesarOperacion(evento, retirar, cuentaSeleccionada.value, "#monto-retiro");
    });
    document.querySelector("#transferir-dinero form").addEventListener("submit", procesarTransferencia);

    document.querySelectorAll("#editar-perfil form").forEach(formulario => {
        formulario.addEventListener("submit", evento => {
            evento.preventDefault();
            alert("La edición del perfil y el cambio de contraseña aún no están disponibles en el servicio.");
        });
    });

    cambiarTipoDestino();
}

// Llena los selectores de cuentas y conserva la selección si todavía existe.
function actualizarSelectores() {
    llenarSelector(cuentaSeleccionada, cuentasUsuario, "Selecciona una cuenta");
    llenarSelector(cuentaOrigen, cuentasUsuario, "Selecciona una cuenta");
    actualizarDestino();
}

// Construye las opciones de un selector a partir de una lista de cuentas.
function llenarSelector(selector, cuentas, textoInicial) {
    const valorAnterior = selector.value;
    selector.replaceChildren(new Option(textoInicial, ""));

    cuentas.forEach(cuenta => {
        const opcion = new Option(
            `${nombreTipoCuenta(cuenta.tipo)} (${cuenta.numero})`,
            cuenta.numero
        );
        selector.add(opcion);
    });

    if (cuentas.some(cuenta => cuenta.numero === valorAnterior)) {
        selector.value = valorAnterior;
    } else if (cuentas.length > 0) {
        selector.selectedIndex = 1;
    }
}

// Presenta el saldo correspondiente a la cuenta seleccionada.
function actualizarSaldo() {
    const cuenta = cuentasUsuario.find(item => item.numero === cuentaSeleccionada.value);
    saldoCuenta.textContent = cuenta
        ? new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 2
        }).format(cuenta.saldo)
        : "Saldo no disponible";
}

// Convierte el tipo interno de cuenta a su nombre visible en la interfaz.
function nombreTipoCuenta(tipo) {
    return tipo === "ahorros" ? "Cuenta de Ahorros" : "Cuenta Corriente";
}

// Muestra u oculta la identificación del destinatario según el tipo de destino.
function cambiarTipoDestino() {
    const esCuentaPropia = tipoDestino.selectedIndex === 0;
    grupoIdentificacionDestino.hidden = esCuentaPropia;
    identificacionDestino.required = !esCuentaPropia;
    cuentasDestinoExterno = [];

    if (esCuentaPropia) {
        actualizarDestino();
    } else {
        llenarSelector(cuentaDestino, [], "Selecciona una cuenta");
    }
}

// Filtra el selector de destino para excluir la cuenta de origen propia.
function actualizarDestino() {
    const esCuentaPropia = tipoDestino.selectedIndex === 0;
    if (!esCuentaPropia) {
        return;
    }

    const cuentasDisponibles = cuentasUsuario.filter(
        cuenta => cuenta.numero !== cuentaOrigen.value
    );
    llenarSelector(cuentaDestino, cuentasDisponibles, "Selecciona una cuenta");
}

// Busca y presenta las cuentas que pertenecen a otro usuario.
function cargarCuentasDestinoExterno() {
    if (tipoDestino.selectedIndex === 0 || !identificacionDestino.value.trim()) {
        return null;
    }

    if (identificacionDestino.value.trim() === sesion.identificacion) {
        cuentasDestinoExterno = [];
        llenarSelector(cuentaDestino, [], "Selecciona una cuenta");
        return {
            exito: false,
            mensaje: "Para transferir entre tus cuentas, selecciona «Otro producto propio»."
        };
    }

    const respuesta = obtenerCuentas(identificacionDestino.value.trim());
    if (!respuesta.exito) {
        cuentasDestinoExterno = [];
        llenarSelector(cuentaDestino, [], "Selecciona una cuenta");
        return respuesta;
    }

    cuentasDestinoExterno = respuesta.cuentas;
    llenarSelector(cuentaDestino, cuentasDestinoExterno, "Selecciona una cuenta");
    return respuesta;
}

// Valida y procesa consignaciones o retiros para la cuenta seleccionada.
function procesarOperacion(evento, operacion, numeroCuenta, selectorMonto) {
    evento.preventDefault();

    const monto = Number(document.querySelector(selectorMonto).value);
    if (!numeroCuenta) {
        alert("Selecciona una cuenta para realizar la operación.");
        return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
        alert("Ingresa un monto válido mayor a cero.");
        return;
    }

    const respuesta = operacion(sesion.identificacion, numeroCuenta, monto);
    if (!respuesta.exito) {
        alert(respuesta.mensaje);
        return;
    }

    alert(`${respuesta.mensaje}\nSaldo actual: ${formatearSaldo(respuesta.saldo)}`);
    evento.currentTarget.reset();
    recargarCuentas();
}

// Valida los datos del formulario y ejecuta una transferencia entre cuentas.
function procesarTransferencia(evento) {
    evento.preventDefault();

    const monto = Number(document.querySelector("#monto-transferencia").value);
    if (!cuentaOrigen.value || !cuentaDestino.value) {
        alert("Selecciona las cuentas de origen y destino.");
        return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
        alert("Ingresa un monto válido mayor a cero.");
        return;
    }

    if (tipoDestino.selectedIndex !== 0) {
        const respuestaCuentasDestino = cargarCuentasDestinoExterno();
        if (!respuestaCuentasDestino || !respuestaCuentasDestino.exito) {
            alert(respuestaCuentasDestino?.mensaje || "Ingresa la identificación del destinatario.");
            return;
        }
        if (!cuentasDestinoExterno.some(cuenta => cuenta.numero === cuentaDestino.value)) {
            alert("Selecciona una cuenta válida del destinatario.");
            return;
        }
    }

    const respuesta = transferir(
        sesion.identificacion,
        cuentaOrigen.value,
        cuentaDestino.value,
        monto
    );
    if (!respuesta.exito) {
        alert(respuesta.mensaje);
        return;
    }

    alert(respuesta.mensaje);
    evento.currentTarget.reset();
    recargarCuentas();
    cambiarTipoDestino();
}

// Vuelve a consultar las cuentas después de completar una operación.
function recargarCuentas() {
    const respuesta = obtenerCuentas(sesion.identificacion);
    if (!respuesta.exito) {
        alert(respuesta.mensaje);
        return;
    }

    cuentasUsuario = respuesta.cuentas;
    actualizarSelectores();
    actualizarSaldo();
    actualizarMovimientos();
}

// Pinta el historial de movimientos del usuario, del más reciente al más antiguo.
function actualizarMovimientos() {
    const respuesta = listarMovimientos(sesion.identificacion);
    if (!respuesta.exito) {
        return;
    }

    cuerpoMovimientos.replaceChildren();

    if (respuesta.movimientos.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 3;
        celda.textContent = "No hay movimientos registrados para mostrar.";
        fila.appendChild(celda);
        cuerpoMovimientos.appendChild(fila);
        return;
    }

    respuesta.movimientos.forEach(movimiento => {
        const fila = document.createElement("tr");
        fila.appendChild(crearCelda(formatearFecha(movimiento.fecha)));
        fila.appendChild(crearCelda(nombreTipoMovimiento(movimiento.tipo)));
        fila.appendChild(crearCelda(formatearSaldo(movimiento.valor)));
        cuerpoMovimientos.appendChild(fila);
    });
}

// Crea una celda de tabla con el texto indicado.
function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}

// Convierte el tipo interno de movimiento a su nombre visible en la interfaz.
function nombreTipoMovimiento(tipo) {
    if (tipo === "consignacion") {
        return "Consignación";
    }
    if (tipo === "retiro") {
        return "Retiro";
    }
    return "Transferencia";
}

// Presenta la fecha y hora del movimiento en formato local.
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

// Formatea valores monetarios en pesos colombianos.
function formatearSaldo(saldo) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 2
    }).format(saldo);
}
