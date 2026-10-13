const users = JSON.parse(localStorage.getItem("users")) || [];
const nameUserInput = document.getElementById("usuario");
const passwordInput = document.getElementById("contrasena");
const formulario2 = document.querySelector(".formulario");



formulario2.addEventListener("submit", startSession)
//-------------------------------------------Iniciar Sesion-------------------------------------------
function startSession(event) {

    event.preventDefault();

    const usuario = nameUserInput.value;
    const password = passwordInput.value;

    const usuarioEncontrado = users.find(
        user =>
            user.user === usuario &&
            user.password === password
    );

    if (usuarioEncontrado) {
        localStorage.setItem(
            "currentUser",
            JSON.stringify(usuarioEncontrado)
        );

        alert("Bienvenido");

        window.location.href = "transacciones.html";

    } else {

        alert("Usuario o contraseña incorrectos");

    }
}