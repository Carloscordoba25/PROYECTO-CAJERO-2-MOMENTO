// Variables globales para manejar usuarios y operaciones
let usuarios = [];
let totalRetiros = 0;
let totalConsignaciones = 0;
let saldo = 0;
let ingresaNombre = "";
let ingresaClave = "";

    

// ---------------- MENÚ PRINCIPAL ----------------
function menuPrincipal() {
    let opcion;
    console.log("*** BIENVENIDO A LA SUCURSAL BANCARIA ***");
    console.log("A continuación, el Menú Principal");
    // Ciclo hasta que el usuario elija salir

    while (opcion !== 3) {
        opcion = parseInt(prompt(`
            Oprima 1 para Iniciar Trámite
            Oprima 2 para Registro Usuario nuevo
            Oprima 3 para Finalizar `));

        switch (opcion) {
            case 1: transacciones(); break;
            case 2: registrar(); break;
            case 3: console.log("SALIENDO DE LA SUCURSAL, HASTA PRONTO 👍"); break;
            default: console.log("🚧 OPCIÓN INVÁLIDA 🚧"); break;
        }
    }
}

// ---------------- CREAR USUARIO ----------------
function crearUsuario(id, nombre, correo, mensaje) {
    // Recupera lista de usuarios desde localStorage
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Muestra todos los usuarios registrados
    for (let i = 0; i < usuarios.length; i++) {
        console.log("Usuario " + (i + 1));
        console.log("ID: " + usuarios[i].id);
        console.log("Nombre: " + usuarios[i].nombre);
        console.log("Correo: " + usuarios[i].correo);
        console.log("-------------------------");
    }

    // Muestra mensaje de confirmación
    console.log(mensaje);
}

// ---------------- REGISTRAR USUARIO ----------------
function registrar() {
    console.log("Vamos a crear un usuario nuevo");
    let id = prompt("Ingresa tu Número de Identificación");
    let nombre = prompt("Ingresa tu nombre de usuario");
    let correo = prompt("Ingresa tu email");
    let clave = prompt("Ingresa una clave de 4 dígitos");
    let validarClave = prompt("Ingresa de nuevo tu clave");

    // Recupera lista actual de usuarios
    usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Crea objeto usuario
    let nuevoUsuario = { id, nombre, correo, clave };

    // Valida que las claves coincidan antes de guardar
    if (clave === validarClave) {
        //push() añade el elemento al final del array
        usuarios.push(nuevoUsuario);

      // Guardamos el arreglo completo en Local Storage
     // JSON.stringify convierte el array en texto para poder almacenarlo
        localStorage.setItem("usuarios", JSON.stringify(usuarios)); 
        crearUsuario(id, nombre, correo, "Usuario creado con Éxito ✅");
    } else {
        console.log("La clave no coincide 🚨");
    }

    console.log("De vuelta al Menú Principal");
}

// ---------------- MENÚ DE TRANSACCIONES ----------------
function transacciones() {
    let opcion = 0;
    while (opcion !== 5) {
        opcion = parseInt(prompt(`¿Qué operación bancaria desea hacer?
            1. Retiros
            2. Consultar Saldo
            3. Consignación
            4. Consultar Movimientos
            5. Menú Principal`));

        switch (opcion) {
            case 1: retiros(); break;
            case 2: consultarSaldo(); break;
            case 3: consignacion(); break;
            case 4: consultarMovimientos(); break;
            case 5: console.log("Regresando al Menú Principal..."); break;
            default: console.log("🚧 OPCIÓN INVÁLIDA 🚧"); break;
        }
    }
}

// ---------------- RETIROS ----------------
function retiros() {
    ingresaNombre = prompt("Ingrese su Nombre de Usuario");
    ingresaClave = prompt("Ingrese su Clave");
    let montoRetiro = parseFloat(prompt("Ingrese monto a Retirar"));


    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    //Recorre el arreglo y devuelve el primer elemento que cumpla la condición que le indiques.
    let usuario = usuarios.find(user => user.nombre === ingresaNombre && user.clave === ingresaClave);

    // Validación: usuario válido, monto positivo y saldo suficiente
    if (usuario && montoRetiro > 0 && montoRetiro <= saldo) {
        saldo -= montoRetiro;
        totalRetiros += montoRetiro;
        console.log(`Bienvenido ${usuario.nombre}, acabas de retirar ${montoRetiro}. Ve a Consultar Saldo para ver tu monto actual.`);
    } else if (montoRetiro > saldo) {
        console.log("Saldo insuficiente 🚨");
    } else {
        console.log("Usuario o contraseña incorrectos 🚧");
    }
}

// ---------------- CONSULTAR SALDO ----------------
function consultarSaldo() {
    ingresaNombre = prompt("Ingrese su Nombre de Usuario");
    ingresaClave = prompt("Ingrese su Clave");

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuario = usuarios.find(user => user.nombre === ingresaNombre && user.clave === ingresaClave);

    if (usuario) {
        console.log(`Bienvenido ${usuario.nombre}, su saldo es ${saldo}`);
    } else {
        console.log("Usuario o contraseña incorrectos 🚧");
    }
}

// ---------------- CONSIGNACIÓN ----------------
function consignacion() {
    ingresaNombre = prompt("Ingrese su Nombre de Usuario");
    ingresaClave = prompt("Ingrese su Clave");
    let consignar = parseFloat(prompt("¿Qué monto desea consignar?"));

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuario = usuarios.find(user => user.nombre === ingresaNombre && user.clave === ingresaClave);

    // Validación: usuario válido y monto positivo
    if (usuario && consignar > 0) {
        saldo += consignar;
        totalConsignaciones += consignar;
        console.log(`Bienvenido ${usuario.nombre}, acabas de consignar ${consignar}`);
    } else if (consignar <= 0) {
        console.log(`${consignar} es monto inválido 🚨 debe ser mayor a 0`);
    } else {
        console.log("Usuario o contraseña incorrectos 🚧");
    }
}

// ---------------- CONSULTAR MOVIMIENTOS ----------------
function consultarMovimientos() {
    ingresaNombre = prompt("Ingrese su Nombre de Usuario");
    ingresaClave = prompt("Ingrese su Clave");

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuario = usuarios.find(user => user.nombre === ingresaNombre && user.clave === ingresaClave);

    if (usuario) {
        console.log(`Bienvenido ${usuario.nombre}, sus movimientos han sido:
            Retiros: ${totalRetiros}
            Consignaciones: ${totalConsignaciones}`);
    } else {
        console.log("Usuario o contraseña incorrectos 🚧");
    }
}

// ---------------- EJECUCIÓN ----------------
menuPrincipal();
