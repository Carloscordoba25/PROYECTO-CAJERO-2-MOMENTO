import { leerUsuarios, guardarUsuarios, leerCuentas, guardarCuentas, leerTarjetas, guardarTarjetas, aumentarIntentos, reiniciarIntentos, guardarSesion } from "../config/persistencia.js";
import { Cliente } from "../models/cliente.js";
import { CuentaAhorros } from "../models/cuenta-ahorros.js";
import { CuentaCorriente } from "../models/cuenta-corriente.js";
import { TarjetaCredito } from "../models/tarjeta-credito.js";

export function registrarCliente(identificacion, nombre, celular, correo, usuario, contrasena, confirmarContrasena) {
    
    if(!identificacion || !nombre || !celular || !correo || !usuario || !contrasena || !confirmarContrasena) {
        return {
            "exito" : false,
            "mensaje" : "No pueden quedar campos vacios."
        }
    }
    
    if(contrasena !== confirmarContrasena) {
        return {
            "exito" : false,
            "mensaje" : "Las contraseñas no coinciden."
        }
    }

    const usuariosActuales = leerUsuarios();
    
    const validarIdUsuario = usuariosActuales.find(u => (u.identificacion === identificacion) || (u.usuario === usuario));
    if(validarIdUsuario) {
        return {
            "exito" : false,
            "mensaje" : "La identificacion o el usuario ya estan registrados."
        }
    }

    const nuevoCliente = new Cliente(identificacion, nombre, celular, correo, usuario, contrasena, "activo");
    const nuevaCuentaAhorros = new CuentaAhorros("AH-" + identificacion, 0, identificacion);
    const nuevaCuentaCorriente = new CuentaCorriente("CT-" + identificacion, 0, identificacion);
    const nuevaTarjetaCredito = new TarjetaCredito("TC-" + identificacion, 2000000, identificacion);

    const clientePlano = clienteADatos(nuevoCliente);
    const ahorrosPlano = cuentaADatos(nuevaCuentaAhorros); 
    const corrientePlano = cuentaADatos(nuevaCuentaCorriente);
    const tarjetaPlano = tarjetaADatos(nuevaTarjetaCredito);
    
    usuariosActuales.push(clientePlano)
    guardarUsuarios(usuariosActuales);

    const cuentasActuales = leerCuentas();
    cuentasActuales.push(ahorrosPlano, corrientePlano)
    guardarCuentas(cuentasActuales);

    const tarjetasActuales = leerTarjetas();
    tarjetasActuales.push(tarjetaPlano)
    guardarTarjetas(tarjetasActuales);

    
    return {
        "exito" : true,
        "mensaje" : "Cliente registrado con exito"
    }
}

export function iniciarSesion(usuario, contrasena) {
    const usuariosActuales = leerUsuarios();

    const indice = usuariosActuales.findIndex(u => u.usuario === usuario);
    if(indice === -1) {
        return {
            "exito" : false,
            "mensaje" : "El usuario no ha sido encontrado."
        }
    }

    const cliente = clienteDesdeDatos(usuariosActuales[indice]);

    if(cliente.estaBloqueado()) {
        return {
            "exito" : false,
            "mensaje" : "La cuenta del usuario " + usuario + " esta bloqueada."
        }
    }

    if(cliente.contrasena !== contrasena) {
        const intentos = aumentarIntentos(usuario);
        if(intentos >= 3) {
            cliente.bloquear();
            usuariosActuales[indice] = clienteADatos(cliente);
            guardarUsuarios(usuariosActuales);
            return {
                "exito" : false,
                "mensaje" : "Cuenta bloqueada por superar 3 intentos fallidos."
            }
        }
        return {
            "exito" : false,
            "mensaje" : "Contraseña incorrecta. Intento " + intentos + " de 3."
        }
    }

    reiniciarIntentos(usuario);
    guardarSesion({ "identificacion" : cliente.identificacion, "usuario" : cliente.usuario });
    return {
        "exito" : true,
        "mensaje" : "Inicio de sesion exitoso"
    }
}

function clienteADatos(cliente) {
    return {
        identificacion: cliente.identificacion,
        nombre: cliente.nombre,
        celular: cliente.celular,
        correo: cliente.correo,
        usuario: cliente.usuario,
        contrasena: cliente.contrasena,
        estado: cliente.estado
    };
}

function cuentaADatos(cuenta) {
    return {
        tipo: cuenta.tipo,
        numero: cuenta.numero,
        saldo: cuenta.saldo,
        clienteIdentificacion: cuenta.clienteIdentificacion
    };
}

function tarjetaADatos(tarjeta) {
    return {
        numero: tarjeta.numero,
        cupo: tarjeta.cupo,
        deuda: tarjeta.deuda,
        clienteIdentificacion: tarjeta.clienteIdentificacion
    };

}

/* --------- Traductores inversos: datos planos -> instancia --------- */

function clienteDesdeDatos(datos) {
    return new Cliente(
        datos.identificacion,
        datos.nombre,
        datos.celular,
        datos.correo,
        datos.usuario,
        datos.contrasena,
        datos.estado
    );
}

// Reconstrucción polimórfica: según el tipo de cuenta se crea la clase hija correcta.
function cuentaDesdeDatos(datos) {
    if (datos.tipo === "ahorros") {
        return new CuentaAhorros(datos.numero, datos.saldo, datos.clienteIdentificacion);
    }
    return new CuentaCorriente(datos.numero, datos.saldo, datos.clienteIdentificacion);
}

function tarjetaDesdeDatos(datos) {
    const tarjeta = new TarjetaCredito(datos.numero, datos.cupo, datos.clienteIdentificacion);
    tarjeta.deuda = datos.deuda;
    return tarjeta;
}