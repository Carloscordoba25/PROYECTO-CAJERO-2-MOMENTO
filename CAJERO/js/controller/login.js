import { iniciarSesion } from "../service/servicios.js";

//Se guarda la referencia al formulario:
const formularioLogin = document.getElementById("formulario-login");

//Se guarda la referencia al campo "usuario":
const campoUsuario = document.getElementById("usuario");

//Se guarda la referencia al campo "contraseña":
const campoContrasena = document.getElementById("contrasena");

//Y por último, la referencia de mensaje del login:
const mensajeLogin = document.getElementById("mensaje-login");


//MANEJANDO EL SUBMIT:
function escucharLogin (evento) {
    evento.preventDefault(); //Previene que la página se recargue al enviar el formulario.

    //Cortar espacios accidentales antes y después al llenar los campos (value = texto en el input.  
    // trim() = quita espacios):
    const usuario = campoUsuario.value.trim();
    const contrasena = campoContrasena.value.trim();

    // console.log(usuario, contrasena);

    if (usuario === "" || contrasena === "") {
        mensajeLogin.textContent = "Debes completar usuario y contraseña.";
        return;
    }

    //Se llama al servicio guardándolo en una variable: 
    const resultado = iniciarSesion(usuario, contrasena);
    
    //El if del fallo:
    if (!resultado.exito) {
        mensajeLogin.textContent = resultado.mensaje;
        campoContrasena.value = "";
        return;
    }

    //Si hay éxito:
    mensajeLogin.textContent = resultado.mensaje;
    setTimeout(() => {window.location.href = "transacciones.html";}, 1000);
    //window.location.href = "transacciones.html";  //Me lleva a esta página
}


//Creando el event listener del tipo submit que disparará la función escucharLogin:
formularioLogin.addEventListener("submit", escucharLogin);


