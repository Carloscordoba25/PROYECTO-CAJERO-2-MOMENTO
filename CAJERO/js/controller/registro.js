import { registrarCliente } from "../service/servicios.js";

const formulario = document.querySelector(".formulario");

formulario.addEventListener("submit", registrarNuevoCliente);

function registrarNuevoCliente(event) {

    event.preventDefault();

    const identificacion = document.getElementById("identificacion").value;
    const nombre = document.getElementById("nombre-completo").value;
    const celular = document.getElementById("celular").value;
    const correo = document.getElementById("correo").value;
    const usuario = document.getElementById("nuevo-usuario").value;
    const contrasena = document.getElementById("nueva-contrasena").value;
    const confirmarContrasena = document.getElementById("confirmar-contrasena").value;

    const resultado = registrarCliente(
        identificacion,
        nombre,
        celular,
        correo,
        usuario,
        contrasena,
        confirmarContrasena
    );

    if (resultado.exito) {
        alert(resultado.mensaje);
        window.location.href = "iniciar-sesion.html";
    } else {
        alert(resultado.mensaje);
    }
}
