let savedUsers = localStorage.getItem('users');
let users;

const idInput = document.getElementById("identificacion");
const nameInput = document.getElementById("nombre-completo");
const emailInput = document.getElementById("correo");
const nameUserInput = document.getElementById("nuevo-usuario");
const passwordInput = document.getElementById("nueva-contrasena");
const confirmPasswordInput = document.getElementById("confirmar-contrasena");
const botonRegistro = document.getElementById("boton-registro");
const botonIngresar = document.getElementById("ingresar")
const formulario = document.querySelector(".formulario");

if(savedUsers === null) {
    //------------------------------------------- Array nulo porque esta vacio-----------------------------------------------------------
    users = [];
}else {
    //-------------------------------------------Recupera el arreglo otravez a objeto-----------------------------------------------------------
    users = [];
    users = JSON.parse(savedUsers);
}

// -------------------------------------------Guardar usuario-------------------------------------------
function saveUSer(users) {
    // -------------------------------------------Convierte a texto el objeto.-------------------------------------------
    const convertToText = JSON.stringify(users);
    // -------------------------------------------Guarda ese texto-------------------------------------------
    localStorage.setItem('users', convertToText);

}

    
formulario.addEventListener("submit", register);
// -------------------------------------------Registrarse-------------------------------------------
function register(event) {

    event.preventDefault();

    const id = idInput.value;
    const name = nameInput.value;
    const email = emailInput.value;
    const user = nameUserInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let failedAttempts= 0;
    let lockDate= undefined;
    let movements =  [];

    if (confirmPassword === password) {
        users.push({id, name, email, user, password, failedAttempts, lockDate, movements});
        saveUSer(users);
        alert('Usuario Registrado')

    }else{
        alert('Las contraseñas no son iguales');
    }
}
