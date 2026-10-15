//FUNCIONES MADRE

// Lee y traduce los datos guardados en el almacenamiento local.
export function leerDatos(clave, valorPorDefecto = []) {
    const textoGuardado = localStorage.getItem(clave);
    if(textoGuardado === null) {
        return valorPorDefecto;
    } 
    return JSON.parse(textoGuardado);
}

// Convierte los datos a texto y los guarda en el almacenamiento local.
export function guardarDatos(clave, datos) {
    const texto = JSON.stringify(datos);
    localStorage.setItem(clave, texto);
}

//FUNCIONES DE USUARIO

// Lee los intentos fallidos de un usuario específico.
export function leerIntentos(usuario){
    return leerDatos("intentos_" + usuario, 0);
} 

// Incrementa en uno los intentos fallidos del usuario y los guarda.
export function aumentarIntentos(usuario) {
    const intentos = leerIntentos(usuario) + 1;
    guardarDatos("intentos_" + usuario, intentos);
    return intentos;
}

// Lee la lista completa de usuarios guardados.
export function leerUsuarios() {
    return leerDatos("usuarios", []);
}

// Guarda la lista completa de usuarios.
export function guardarUsuarios(lista) {
    guardarDatos("usuarios", lista);
}

// Reinicia el contador de intentos
export function reiniciarIntentos(usuario) {
    guardarDatos("intentos_" + usuario, 0);
}

// FUNCIONES DE CUENTAS. 

// Lee la lista completa de cuentas.
export function leerCuentas() {
    return leerDatos("cuentas", []);
}

// Guarda la lista completa de cuentas.
export function guardarCuentas(lista) {
    guardarDatos("cuentas", lista);
}

//FUNCIONES DE MOVIMIENTOS

// Lee la lista completa de movimientos.
export function leerMovimientos() {
    return leerDatos("movimientos", []);
}
// Guarda la lista completa de movimientos.
export function guardarMovimientos(lista) {
    guardarDatos("movimientos", lista);
}

// FUNCIONES DE SESION

// Guarda los datos de la sesión actual.
export function guardarSesion(datos) {
    guardarDatos("sesion", datos);
}

// Lee la sesión actual (devuelve null si nadie ha iniciado sesión).
export function leerSesion() {
    return leerDatos("sesion", null);
}

// Borra la sesión actual para cerrar la cuenta.
export function cerrarSesion() {
    localStorage.removeItem("sesion");
}

// FUNCIONES DE TARJETAS

// Lee la lista completa de tarjetas.
export function leerTarjetas() {
    return leerDatos("tarjetas", []);
}

// Guarda la lista completa de tarjetas.
export function guardarTarjetas(lista) {
    guardarDatos("tarjetas", lista);
}